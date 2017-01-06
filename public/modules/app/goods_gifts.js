/*
 * 组合促销列表相关JS方法，复制  goods_promote.js  稍做改动，可能需要做优化;
 * by Adang
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            }
        },
        init: function (params) {

            page.bindEvents();
        },
        bindEvents: function () {
            var $app = $('#app');
            //选择sku
            $app.on('click', '.js-sku', page.selectSku);

            //选择赠品
            $app.on('change', '.item :radio', function () {
                var $item = $(this).closest('.item');
                if($(this).is(":checked")){
                    $item.addClass('selected').siblings().removeClass('selected');
                }
            });

            //添加到购物车
            $app.on('click', '.js-addToCart', page.addToCart);

            //点击遮罩或关闭按钮
            $app.on('click', '.mask, .js-close', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //选完sku，点击确定
            $app.on('click', '.js-sku-confirm', function () {
                var $this = $(this), $item = $('.js-sku.current').closest('.item');

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
                    $item.data('item-id', skuInfo.itemId).data('count', skuInfo.detail.promotionSkuCount)
                        .find('.sku-edit').addClass('selected').text('已选' + skuInfo.desc.join(','))
                        .end().find('.pic img').attr('src', skuInfo.detail.itemPic)
                        .end().find('.desc sub').text('x' + skuInfo.detail.promotionSkuCount);

                    //关闭模态框
                    $this.closest('.u-sku').find('.js-close').trigger('click');

                });
            });

        },
        //选择sku
        selectSku: function () {
            var c = page.config;
            var $this = $(this),
                templateId = $this.data('template-id'),
                reservedNo = c.params.reservedNo;

            //当前sku模态框，不需要再次初始化
            if ($this.hasClass('current')) {
                $('.u-sku').addClass('show');
                return false;
            }
            //添加标识
            $('.js-sku').removeClass('current');

            var params = {
                inlet: $this.closest('.main-product')[0] ? 9 : 10,  //促销选择赠品入口
                reservedNo: reservedNo,
                templateId: templateId
            };
            var locationInfo = JSON.parse(localStorage.getItem(CONST.local_detail_location));
            if (locationInfo) {
                params.areaId = locationInfo.areaId;
                params.lat = locationInfo.lat;
                params.lng = locationInfo.lng;
            }
            M.ajax({
                location: true,
                url: '/api/goods_sku',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    $('.u-sku').find('.content').empty().append(res.template)
                        .find('.quantity, .sku-sales').remove().end()
                        .end().addClass('show');
                    require.async('app/sku', function (sku) {
                        sku.init($('.sku'));
                        $this.addClass('current');
                    });
                }
            });
        },
        //添加商品到购物车
        addToCart: function () {
            var c = page.config;
            var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID

            //校验是否全部都有itemId
            var $items = $('.item.selected');
            for(var i = 0; i < $items.length; i++){
                var $item = $($items[i]);
                if (!$item.data('item-id')) {
                    $item.is('.main-product') ? M.tips('请选择主商品的商品规格') : M.tips('请选择赠品的商品规格');
                    return false;
                }
            }

            var itemArr = $.map($items, function (item, index) {
                return {
                    "isBindShop": false,
                    "templateId": $(item).data('template-id'),
                    "itemId": $(item).data('item-id'),
                    "count": +$(item).data('count'),
                    "isGift": $(item).is('.main-product') ? false : true,
                    "pmtCode": 0   //	0 没得选 1选择每月福利 2 其他促销
                };
            });

            var params = {
                cartId: local_cartId,
                jsonTerm: JSON.stringify(itemArr),
                pmtType: 6,
                reservedNo: c.params.reservedNo
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
                    } else {
                        return M.tips(res.msg);
                    }
                }
            });
        }

    };

    page.init();
});