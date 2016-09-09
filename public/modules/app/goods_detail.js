/*
 * 商品详情
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params,
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            // ajax向node请求的url;
            api: {
                "extra": "/api/goods_detail_extra"
            }
        },
        init: function (container, params) {
            var c = page.config;
            c.$container = container;

            M.ajax({
                location: true,  //获取地理位置作为参数
                showLoading: false,
                url: c.api.extra,
                data: params ? {data: JSON.stringify(params)} : {},
                success: function (res) {
                    //console.log('success--->', res);
                    var template = res.template;
                    $('.spa').append(template);
                }
            });

            // 购物车内是否有新商品;
            if (localStorage.getItem(CONST.local_cart_newGoods)) {
                $(".js-goods-cart").addClass("new");
            }
            //加载swipe
            require.async('swipe', function () {
                M.swipe.init(); //初始化Swipe
            });

            //懒加载，定时器不要删除
            setTimeout(function () {
                M.lazyLoad.init();
            }, 250);
            // history为空或者history.length <= 0的时候，显示返回首页链接;
            if(!history.length || history.length == 1){
                $(".m-goods-detail").prepend('<div class="history-back"><a href="http://m.mamhao.com/">商城首页</a><div');
            }
            // 详情页微信定义分享
            require.async('weixin', function (wx) {
                M.wx.share(wx, {
                    title: $(".js-share-title").text(),
                    url: location.href,
                    image: $("#swipe-banner img:first").data("share"),
                    desc: $(".js-share-desc").text()
                });
            });

            $(function () {
                page.bindEvents();
            });
        },
        bindEvents: function () {
            var c = page.config, hashParams = c.hashParams();
            var $module = c.$container;

            /*质检报告，数据缓存到本地*/
            var templateId = hashParams.templateId,
                qualityPic = JSON.parse(localStorage.getItem(CONST.local_qualityPic)) || {};
            qualityPic[templateId] = $('.quality').data('pic');
            localStorage.setItem(CONST.local_qualityPic, JSON.stringify(qualityPic));

            //固定tab，此处有待优化
            var $tab = $('.u-tab'), $items = $('#swipe-detail .ui-swipe-item');
            var $detail = $('.m-goods-detail'), flexH = $detail.height() - $tab.height();
            $items.height(flexH);
            /*var $tab = $('.u-tab'), $items = $('#swipe-detail .ui-swipe-item'), offsetTop = $tab[0].offsetTop;
             $module.on('touchmove scroll', function () {
             var $this = $(this), flexH = $this.height() - $tab.height();
             $items.css("min-height", flexH);
             if (!$tab.hasClass('top')) offsetTop = $tab[0].offsetTop;
             if ($this.scrollTop() >= offsetTop) {
             $tab.addClass('top');
             } else {
             $tab.removeClass('top');
             }
             });*/

            //点击好妈妈说
            $module.on('click', '.guide .ellipsis', function () {
                $(this).toggleClass('collapse');
            });

            //点击优惠券或促销列表
            $module.on('click', '.js-nav-list', function () {
                $(this).siblings('.u-fixed').addClass('show');
            });

            //点击领券优惠券
            $module.on('click', '.js-voucher', function () {
                var $this = $(this), id = $this.closest('li').data('id');
                if ($this.hasClass('ban')) return false;
                M.ajax({
                    url: '/api/coupons_receive',
                    data: {tid: id},
                    success: function (res) {
                        if (res.success_code == 200) {
                            $this.addClass('ban').text('已领取');
                            M.tips('领取成功');
                        } else {
                            return M.tips(res.msg);
                        }
                    },
                    error: function (res) {
                        var errorMsg = res.msg;
                        if (/^(-1)$/.test(res.error_code)) {
                            errorMsg = '您还未登录，请登录后再试！';
                        }
                        M.tips(errorMsg);
                    }
                });
            });

            //点击门店地址
            $module.on('click', '.js-address', function () {
                $('.m-select-address').addClass('show');
            });

            $module.on('click', '.m-select-address .list li', function () {
                var $this = $(this), info = $this.data('json');
                localStorage.setItem(CONST.local_detail_location, JSON.stringify(info));
                location.reload();
            });

            $module.on('click', '.m-select-address .gps', function () {
                localStorage.removeItem(CONST.local_detail_location);
                location.reload();
            });


            //点击遮罩或关闭按钮
            $module.on('click', '.mask, .js-close', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //加入购物车、立即购买
            $module.on('click', '.js-addToCart, .js-buy', function () {
                if(!$module.find('.sku').data()) return false;
                var action = $(this).is('.js-buy') ? 'buy' : 'addToCart';
                $module.find('.u-sku').addClass('show');
                require.async('app/sku', function (sku) {
                    sku.init($module.find('.sku'));
                    $module.find('.u-quantity .number').spinner();  //改变数量控制
                    $module.find('.js-sku-confirm').data('action', action);
                });
            });

            //选完sku，点击确定
            $module.on('click', '.js-sku-confirm', function () {
                var action = $(this).data('action');
                switch (action) {
                    case 'buy':
                        page.buyNow();
                        break;
                    case 'addToCart':
                        page.addToCart();
                        break;
                }
            });

            // 点击查看评论大图;
            $module.on('click', '.js-comment-pic li img', function () {
                var thas = $(this), parents = thas.parents(".js-comment-pic");
                require.async('weixin', function (wx) {
                    wx.previewImage({
                        urls: parents.data("json"),
                        current: thas.attr("src")
                    });
                });
            });


        },
        //添加商品到购物车
        addToCart: function () {
            var c = page.config, hashParams = c.hashParams();
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
                        "isBindShop": false,
                        "itemId": skuInfo.itemId,
                        "shopId": hashParams.shopId,
                        "templateId": hashParams.templateId,
                        "companyId": hashParams.companyId,
                        "count": +$('.u-sku .u-quantity .number').text()
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
                            M.tips('商品已成功添加到购物车');
                            $('.u-sku .js-close').trigger('click');
                            // 标记购物车图标加红点;
                            localStorage.setItem(CONST.local_cart_newGoods, 1);
                            $(".js-goods-cart").addClass("new");
                        } else {
                            return M.tips(res.msg);
                        }
                    }
                });
            });
        },
        //立即购买
        buyNow: function () {
            var c = page.config, hashParams = c.hashParams();
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

                var params = {
                    inlet: 2,  //1 购物车  2 商品详情 4 麻豆尊享
                    jsonTerm: JSON.stringify({
                        "itemId": skuInfo.itemId,
                        "templateId": hashParams.templateId,
                        "count": +$('.u-sku .u-quantity .number').text(),
                        "shopId": hashParams.shopId,
                        "companyId": hashParams.companyId,
                        "isBindShop": 0
                    })
                };
                location.href = '/cart#/settlement/' + $.param(params);

            });
        }
    };

    module.exports = page;
});