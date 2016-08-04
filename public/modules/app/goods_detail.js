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


            //加入购物车
            $('.js-addToCart').on('click', page.addToCart);
            $('.js-buy').on('click', function () {
                M.dialog('呵呵，立即购买也还没做！！！');
            });

        },
        //添加商品到购物车
        addToCart: function () {
            var c = page.config, urlParams = c.params;
            var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
            var local_location = localStorage.getItem(CONST.local_location); //本地存储的位置信息
            var params = {
                areaId: local_location.areaId,
                cartId: local_cartId,
                jsonTerm: JSON.stringify([{
                    "isBindShop": false,
                    "itemId": urlParams.itemId,
                    "shopId": urlParams.shopId,
                    "templateId": urlParams.templateId,
                    "companyId": urlParams.companyId,
                    "count": 1
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
                    }
                }
            });
        }
    };

    page.init();
});