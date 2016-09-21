// 扫码付-获取订单信息;
define(function (require, exports, module) {
    var page = {
        tools: {

        },
        config: {
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {
            var self = this, c = self.config;
            c.resource = 3; // 扫码付来源参数;
            VM && $.extend(c, VM);
            // 校验状态，提示对应信息;
            if(c.status == 2){
                M.tips("验证码已失效，请重试！");
            }else if(c.status == 3){
                M.tips("验证码错误，请重试！");
            }
            // 获取图片验证码;
            if(c.status == 1 || c.status == 2 || c.status == 3){
                self.getVcode();
            }
            //console.log();

            page.bindEvents();
        },
        bindEvents: function () {
            var self = this, c = self.config;
            // 微信端进行受权;
            if(c.isWeChat){
                require.async('weixin', function (wx) {
                    // 隐藏可分享按钮;
                    wx.hideOptionMenu();
                });
            }
            // 刷新页面;
            $(".js-code-reload").on("click", function () {
                if(c.isReload) return;
                c.isReload = true;
                $(this).addClass("ban").html("正在更新，请稍后...");
                var location = window.location;
                window.location.href = [location.origin, location.pathname, "?k=", encodeURIComponent(M.url.query("k"))].join("");
                //window.location.reload();
            });
            //支付宝支付
            $('.js-alipay').on('touchstart',function () {
                if($(this).data("pay")) return;
                $(this).html("正在准备付款...").data("pay", true);
                M.pay.alipay({
                    data: {batchNo: c.orderNo, shopId: c.shopId, resource: c.resource}
                });
            });
            //微信支付
            $('.js-weixin').on('touchstart',function () {
                //alert("touchstart");
                M.pay.weixin({
                    data: {orderNo: c.orderNo, openId: c.openId, shopId: c.shopId, resource: c.resource},
                    callback: '/pay/codeSuccess.html'
                });
            });
            // 图文验证码;
            $(".js-submit").on("click", function () {
                var code = $(".js-code");
                if(c.isAjax) return;
                if(code.val() == ""){
                    return M.tips("请输入图文验证码!");
                }
                // 页面跳转;
                var location = window.location;
                var param = M.url.params;
                param.vcode = code.val();
                window.location.href = [location.origin, location.pathname, "?", $.param(param)].join("");

                //var location = window.location;
                //window.location.href = [location.origin, location.pathname, "?k=", c.k, "&vcode=", code.val()].join("");
            });
            // 点击刷新图文验证码;
            $(".js-image-vcode").on("touchend", function () {
                self.getVcode();
            });
        },
        getVcode: function () {
            var self = this, c = self.config;
            M.ajax({
                url: '/pay/codeImageVcode.html',
                success: function (res) {
                    $(".js-image-vcode").attr("src", res.src);
                }
            });
        }
    };
    page.init();
});