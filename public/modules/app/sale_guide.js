/**
 * 会员购导购页
 */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            imgSize: '@1e_300w_300h_0c_0i_0o_100q_1x.jpg'			// 图片压缩比;
        },
        info: {},
        init: function () {
            var self = this, o = self.info, c = self.config;
            o.elems = $(".m-shopping-all");
            o.quality = $(".js-quality");
            o.goods = $(".js-goods");
            o.tools = $(".js-tools");
            o.similar = $(".js-similar");

            c.params = M.url.params();
            c.vm = VM;
            if(M.tools.isMamahao){
                // APP更多菜单;
                APP.config.Bottom.data = [{type: 1, system: 1}, {type: 1, system: 2}, {type: 1, system: 4}, {type: 1, system: 5}];
                //APP.config.Bottom.data = [];
                // 返回不刷新此页面;
                APP.config.refresh = false;
                // APP多个事件;
                SDK.tools.callpush.push({i: 10, f: "topcar"}, {i: 98, f: "refresh"});
            }else{
                o.elems.prepend('<div class="history-back"><a href="//' + location.host + '/sale/">妈妈好 - 每月购</a><div');
            }



            self.bind();
            self.quality();
            self.getItems();
            self.easemobim();

            // 定义分享信息;
            self.weixin({
                title: c.vm.share.title,
                desc: c.vm.share.subTitle,
                content: c.vm.share.subTitle,
                image: c.vm.share.icon
            });
        },
        bind: function () {
            var self = this, o = self.info, c = self.config;
            var $module = $('#app');

            // 查看质检报告大图;
            if(o.quality.length){
                o.quality.on("click", function () {
                    if(M.tools.isMamahao){
                        APP.open("photo");
                    }else if(M.tools.isWeixin){
                        require.async('weixin', function (wx) {
                            wx.previewImage(c.wxPhoto);
                        });
                    }
                });
            }
            // 查看普通商品详情;
            $("#app").on("click", ".js-open-item", function(e){
                var target = $(e.target), thas = $(this), itemId = thas.data("itemid"), templateId = thas.data("templateid");
                if(M.tools.isMamahao){
                    // 点击非选择sku按钮，访问商品详情页;
                    if(!target.hasClass("js-sku")){
                        APP.config.Detail = {
                            itemId: itemId,
                            templateId: templateId
                        };
                        APP.open("detail");
                    }else{
                        // 选择SKU;
                        APP.config.Sku = {
                            inlet: 6,
                            templateId: templateId
                        };
                        APP.open("sku");
                    }
                }else if(M.tools.isWeixin){
                    if(!target.hasClass("js-sku")){
                        window.location.href = "/goods/detail/?vip=1&inlet=6&templateId="+ templateId +"&itemId=" + itemId;
                    }else{
                        require.async('app/sku', function (sku) {
                            sku.init($module.find('.sku'));
                            $module.find('.u-quantity .number').spinner();  //改变数量控制
                            $('.sku-sales').hide();
                            $module.find('.u-sku').addClass('show');
                        });
                    }
                }else{
                    // 其他平台;
                    self.download();
                }
            });

            //点击遮罩或关闭按钮
            $module.on('click', '.mask, .js-close', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //点击sku的促销选择
            $module.on('click', '.sku-sales dd a', function () {
                var $this = $(this);
                $this.addClass('active').siblings().removeClass('active');
            });

            //选完sku，点击确定
            $module.on('click', '.js-sku-confirm', function () {
                page.addToCart();
            });

            // 联系客服;
            o.tools.on("click", ".js-single-artificial", function(){
                if(M.tools.isMamahao) {
                    APP.config.Easemob = c.easemob;
                    APP.open("easemob"); // 环信官方客服系统;
                }else{
                    M.im.track(c.easemob.data);
                    //window.location.href = 'http://h5.mamahao.com/help/service/';
                }
            });
            o.tools.on("click", ".js-item", function () {
                o.goods.find(".js-open-item").trigger("click");
            });
            // 查看同类商品
            o.similar.on("click", "a", function () {
                var params = {
                    groupId: $(this).data("id"),
                    keyword: $(this).data("name")
                };
                if(M.tools.isMamahao){
                    APP.config.Search = {
                        entry: 3,
                        groupId: params.groupId,
                        keyword: params.keyword
                    };
                    APP.open('search');
                    //alert(JSON.stringify(APP.config.Search));
                }else{
                    window.location.href = "/sale/similar/?" + $.param(params);
                }
            });
        },
        //添加商品到购物车
        addToCart: function () {
            var c = page.config, hashParams = c.params;
            //获取当前选中的sku信息
            require.async('app/sku', function (sku) {
                var skuInfo = sku.selected();

                if (!skuInfo.itemId) {
                    var specTips = $.map($('.sku dl dt'), function (item) {
                        if (!$(item).closest('dl').find('.sku-key.active')[0]) {
                            return $(item).text();
                        }
                    })[0];
                    return M.tips('请选择' + specTips);
                }

                var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
                var params = {
                    cartId: local_cartId,
                    jsonTerm: JSON.stringify([{
                        "isBindShop": hashParams.shopId ? true : false,
                        "itemId": skuInfo.itemId,
                        "templateId": hashParams.styleNumId,
                        "count": +$('.u-sku .u-quantity .number').text(),
                        "pmtCode": 1
                    }]),
                    pmtType: 0
                };
                M.ajax({
                    location: true,
                    url: '/api/addToCart',
                    data: {data: JSON.stringify(params)},
                    success: function (res) {
                        if (res.success_code == 200) {
                            localStorage.setItem(CONST.local_cartId, res.cartId);  //更新本地购物车ID
                            M.tips({class: 'true', body: '加入购物车成功'});
                            $('.u-sku .js-close').trigger('click');
                            // 标记购物车图标加红点;
                            localStorage.setItem(CONST.local_cart_newGoods, 1);
                        } else {
                            return M.tips(res.msg);
                        }
                    }
                });
            });
        },
        // 质检报告;
        quality: function () {
            var self = this, o = self.info, c = self.config, imgs = o.quality.data('json');
            if(!o.quality.length) return;
            // 妈妈好;
            if(M.tools.isMamahao){
                APP.config.photo = {
                    data: imgs,
                    index: 0
                };
            }
            // 微信端查看大图传值;
            c.wxPhoto = {
                current: imgs[0], // 当前显示图片的http链接
                urls: imgs // 需要预览的图片http链接列表
            }
        },
        // 整理导购页内的插入商品信息;
        getItems: function () {
            var self = this, o = self.info, c = self.config;
            var items = o.elems.find(".ke-items");
            if(!items.length) return; // 如果没有添加商品卡，直接跳出;
            c.items = [];
            $.each(items, function(){
                var thas = $(this), id = thas.attr("alt");
                c.items.push(id);
                thas.after('<div class="js-ke-item" data-item-id="'+ id +'"></div>');
                thas.remove();
            });
            // 加载导购页商品卡里的商品信息;
            var params = {
                styleNumIds: c.items.join(','),
                vipInfoShow: true
            };
            M.ajax({
                url: "/api/sale/guide_items/",
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    self.setItems(res);
                }
            });
        },
        // 处理导购页内的商品;
        setItems: function(res){
            var self = this, o = self.info, c = self.config,
                data = res, i = 0, l = data.length;
            for(; i < l; i++){
                if(data[i].online == 0){
                    // 如果此商品已被下架，就不输出商品相关信息;
                    $(".js-ke-item[data-item-id="+ data[i].templateId +"]").remove();
                    continue;
                }
                var arr = [];
                arr.push('<div class="item js-open-item" data-itemid="'+ data[i].itemId +'" data-templateid="'+ data[i].templateId +'">');
                arr.push('<div class="pic"><img src="'+ data[i].pic + c.imgSize +'" /></div>');
                arr.push('<dl><dt>'+ data[i].title +'</dt>');
                arr.push('<dd><strong>￥'+ data[i].price +'</strong><p>');
                arr.push('</p></dd></dl></div>');
                $(".js-ke-item[data-item-id="+ data[i].templateId +"]").html(arr.join(''));
            }
        },
        // 提示下载APP
        download: function(){
            M.dialog({
                body: "喜欢该商品？<br>赶紧下载妈妈好App购买吧！",
                buttons: [
                    {"text": "朕再想想",},
                    {"text": "立即下载", "class": "success", "onClick": function () {
                        window.location.href = "http://app.mamahao.com/";
                    }}
                ]
            });
        },
        // 微信分享;
        weixin: function(res){
            if(M.tools.isWeixin){
                require.async('weixin', function (wx) {
                    M.wx.share(wx, {
                        title: res.title,
                        url: location.href,
                        image: res.image,
                        desc: res.desc
                    });
                });
            }else if(M.tools.isMamahao){
                $.extend(APP.config.Share.data, res);
            }
        },
        // 环信客服
        easemobim: function () {
            var self = this, o = self.info, c = self.config;
            c.easemob = {
                type: 3,
                data: {
                    title: "我正在看每月购商品：",
                    price: "查看详情",
                    desc: o.goods.find('dt').text(),
                    img_url: o.goods.find('img').attr('src') || "//img.mamhao.cn/s/common/images/icon-114.png",
                    item_url: window.location.href
                }
            };
            // 初始化联系客服;
            if(!M.im.easemobim && !M.tools.isMamahao) M.im.init();
        }
    };
    page.init();
    module.exports = page;
});