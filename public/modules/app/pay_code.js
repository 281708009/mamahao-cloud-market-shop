// 扫码付;
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.query(),
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {
            var self = this, c = self.config;
            $.extend(c, VM);
            console.log(c);
            page.bindEvents();
        },
        bindEvents: function () {
            var self = this, c = self.config;
            // 微信端进行受权;
            if(c.isWeChat){
                require.async('weixin', function (wx) {
                    M.wx.share(wx);
                });
            }
        }
    };
    page.init();
});