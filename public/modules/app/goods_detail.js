/*
 * 商品详情
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params,
            // ajax向node请求的url;
            api: {}
        },
        init: function () {
            //加载swipe
            require.async('swipe', function () {
                M.swipe.init(); //初始化Swipe
            });

            page.bindEvents();
        },
        bindEvents: function () {

            /*质检报告，数据缓存到本地*/
            var templateId = M.url.query('templateId'),
                qualityPic = JSON.parse(localStorage.getItem(CONST.local_qualityPic)) || {};
            qualityPic[templateId] = $('.quality').data('pic');
            localStorage.setItem(CONST.local_qualityPic, JSON.stringify(qualityPic));

            //固定tab，此处有待优化
            var $tab = $('.u-tab'), $items = $('#swipe-detail .ui-swipe-item'), offsetTop = $tab[0].offsetTop;
            $('.m-goods-detail').on('touchmove scroll', function () {
                var $this = $(this), flexH = $this.height() - $tab.height();
                $items.height(flexH);
                if (!$tab.hasClass('top')) offsetTop = $tab[0].offsetTop;
                if ($this.scrollTop() >= offsetTop) {
                    $tab.addClass('top');
                } else {
                    $tab.removeClass('top');
                }
            });

            //点击好妈妈说
            $('.guide .ellipsis').on('click', function () {
                $(this).toggleClass('collapse');
            });

            //点击优惠券或促销列表
            $('.js-nav-list').on('click', function () {
                $(this).siblings('.m-sale-pop').addClass('show');
            });

            //点击门店地址
            $('.js-store').on('click', function () {
                $('.m-select-address').addClass('show');
            });


            //点击遮罩或关闭按钮
            $('.mask, .js-close').on('click', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //加入购物车、立即购买
            $('.js-addToCart, .js-buy').on('click', function () {
                var action = $(this).is('.js-buy') ? 'buy' : 'addToCart';
                $('.js-sku-confirm').data('action', action);

                $('.u-sku').addClass('show');
                require.async('app/sku', function (sku) {
                    sku.init($('.sku'));
                });
            });

            //选完sku，点击确定
            $('.js-sku-confirm').on('click', function () {
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

            //改变数量控制
            $('.u-quantity .number').spinner();

        },
        //添加商品到购物车
        addToCart: function () {
            //获取当前选中的sku信息
            require.async('app/sku', function (sku) {
                var skuInfo = sku.selected();

                if (!skuInfo.itemId) {
                    return M.tips('请选择SKU');
                }

                var c = page.config, urlParams = c.params;
                var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
                var local_location = localStorage.getItem(CONST.local_location); //本地存储的位置信息
                var params = {
                    areaId: local_location.areaId,
                    cartId: local_cartId,
                    jsonTerm: JSON.stringify([{
                        "isBindShop": false,
                        "itemId": skuInfo.itemId,
                        "shopId": urlParams.shopId,
                        "templateId": urlParams.templateId,
                        "companyId": urlParams.companyId,
                        "count": +$('.u-sku .u-quantity .number').text()
                    }]),
                    pmtType: 0
                };
                M.ajax({
                    url: '/api/addToCart',
                    data: {data: JSON.stringify(params)},
                    success: function (res) {
                        if (res.success_code == 200) {
                            localStorage.setItem(CONST.local_cartId, res.cartId);  //更新本地购物车ID
                            M.tips('商品已成功添加到购物车');
                            $('.u-sku .js-close').trigger('click');
                        }
                    }
                });
            });
        },
        //立即购买
        buyNow: function () {
            //获取当前选中的sku信息
            require.async('app/sku', function (sku) {
                var skuInfo = sku.selected();

                if (!skuInfo.itemId) {
                    return M.tips('请选择SKU');
                }

                var c = page.config, urlParams = c.params;

                var params = {
                    inlet: 2,  //1 购物车  2 商品详情 4 麻豆尊享
                    jsonTerm: JSON.stringify({
                        "itemId": skuInfo.itemId,
                        "templateId": urlParams.templateId,
                        "count": +$('.u-sku .u-quantity .number').text(),
                        "shopId": urlParams.shopId,
                        "companyId": urlParams.companyId,
                        "isBindShop": 0
                    })
                };
                location.href = '/cart#/settlement/' + $.param(params);

            });
        }
    };

    /*
     * 这里确保页面加载完后再绑定相应的事件，否则会出事数据缺失的问题
     * 比如sku的选择
     * */
    $(function () {
        page.init();
        M.lazyLoad.init();
    });
});