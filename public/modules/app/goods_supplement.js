/**
 * 凑单商品列表
 */

 define(function(require, exports, module){
    var page = {
        config: {
            params: M.url.params(),
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            // ajax向node请求的url;
            api: {
            }
        },
        init:function(argument) {
            var self = this, c = self.config, params = c.params;
            c.$container = $('#app');
            self.bindEvents();
            //加载swipe
            M.swipe.init({startSlide:$('.ui-swipe-tab li.active').index()});//初始化Swipe
            $.pagination({  //分页
                scrollBox: '.ui-swipe-item',
                container: 'ul.u-goods-one',
                keys:{count:'pageSize'},
                api: '/api/goods_supplement',
                fnSuccess: function (res, ele) {
                    var data = res.data;
                    if (!data.template) {
                        return ele.data('locked', true);
                    }
                    var $container = $(data.template);
                    ele.append($container);
                }
            });
        },
        bindEvents: function () {
            var c = page.config, hashParams = c.params, $module = c.$container;
            //点击遮罩或关闭按钮
            $module.on('click', '.mask, .js-close', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });
            //选完sku，点击确定
            $module.on('click', '.js-sku-confirm', function () {
                var $this = $(this), $goods = $('.js-sku.current').closest('.goods'), $item = $goods.closest('.item');
                var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
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

                    //显示已选sku信息
                    $goods.attr('data-item-id', skuInfo.itemId)
                    .attr('data-price', skuInfo.detail.price)
                    .attr('data-oprice', skuInfo.detail.oprice)
                    .find('.spec').addClass('selected').text('已选' + skuInfo.desc.join(','));

                    //关闭模态框
                    $this.closest('.u-sku').find('.js-close').trigger('click');
                    var params = {
                        cartId: local_cartId,
                        jsonTerm: JSON.stringify([{
                            "itemId": skuInfo.itemId,
                            "templateId": hashParams.templateId,
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
                                M.tips({body:'加入购物车成功',class:'true'});
                                $('.u-sku .js-close').trigger('click');
                                if(res.deliveLeavePrice > 0){
                                    $('.u-go-cart dl').html('<dt>合计：<strong>￥' + res.totalPrice + '</strong></dt><dd>还差￥' + res.deliveLeavePrice + '享免运费服务</dd>');
                                }else{
                                    $('.u-go-cart dl').html('<dt>合计：<strong>￥' + res.totalPrice + '</strong></dt><dd>已享免运费服务</dd>');
                                }
                            } else {
                                return M.tips(res.msg);

                            }
                        }
                    });

                });
            });
            // 点击购物车图标 弹出sku选择框
            $module.on('click', '.js-add-cart', function(){
                var c = page.config;
                var templateId = $(this).closest('li').data('templateId');
                c.params.templateId = templateId;
                //当前sku模态框，不需要再次初始化
                if (templateId === $('.js-sku-confirm').data('template-id')) {
                    $('.u-sku').addClass('show');
                    return false;
                }
                var params = {
                    inlet: 6,
                    templateId: templateId
                };
                M.ajax({
                    location: true,
                    url: '/api/goods_sku',
                    data: {data: JSON.stringify(params)},
                    success: function (res) {
                        $('.u-sku').find('.content').empty().append(res.template).end().addClass('show');
                        require.async('app/sku', function (sku) {
                            sku.init($('.sku'));
                        $('.u-quantity .number').spinner();  //改变数量控制
                        $('.js-sku-confirm').data('template-id', templateId);
                    });
                    }
                });
                
            });
        }
    };

    page.init();
});