define(function (require, exports, module) {
    var page = {
        config: {
            api: {
                getCoupons: '/api/coupon',
                queryStlOrderVouchers: '/api/queryStlOrderVouchers'
            }
        },
        init: function () {
            var self = this, c = self.config;
            c.$module = $('#app');
            require.async('app/settlement_checkout', function (func) {
                new func(page, c.$module).render();
            });

            self.getCoupons();

        },
        /* 获取可用优惠券列表 */
        getCoupons: function () {
            var self = this, c = self.config, API = c.api,orderNo = $('[name="orderNo"]').val();
            var params = {orderNo:orderNo};
            M.ajax({
                location: true,
                url: API.queryStlOrderVouchers,
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    c.$module.find('.more-coupon').html(res.template);
                }
            });
        }
    };

    page.init();
});