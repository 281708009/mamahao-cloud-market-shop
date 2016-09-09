// 扫码付-成功;
define(function (require, exports, module) {
    var page = {
        tools: {
            // 校验手机号码;
            isMobile: function(v){return !/^1{1,}[3,4,5,7,8]{1}\d{9}$/.test(v)?false:true;}
        },
        config: {
            // ajax向node请求的url;
            api: {

            }
        },
        info: {},
        init: function () {
            var self = this, o = self.info, c = self.config;
            VM && $.extend(c, VM);
            o.mobile = $(".js-mobile");
            o.code = $(".js-code");
            o.getCode = $(".js-get-code");
            o.submit = $(".js-submit");
            o.pop = $(".m-pop-all");

            //console.log(c);
            page.bindEvents();
            page.getCoupon();
        },
        bindEvents: function () {
            var self = this, o = self.info, c = self.config;
            // 隐藏提示下载;
            $(".js-close-app").on("click", function () {
                $(".MA-download-pop-all").removeClass("show");
            });
            // 微信端进行受权;
            if(c.isWeChat){
                require.async('weixin', function (wx) {
                    //M.wx.share(wx);
                    // 隐藏可分享按钮;
                    M.wx.init(wx, {
                        ready: function () {
                            wx.hideOptionMenu();
                        }
                    });
                });
            }
            // 领取优惠卷;
            o.submit.on("click", function () {
                self.getSubmit();
            });
            // 获取验证码;
            o.getCode.on("click", function () {
                self.getSMS();
            });
            // 关闭成功提示层;
            o.pop.on("click", ".title .close", function () {
                o.pop.removeClass("show");
                o.mobile.val("");
                o.code.val("");
            });
        },
        // 获取优惠劵信息;
        getCoupon: function () {
            var self = this, o = self.info, c = self.config;
            M.ajax({
                url: "/pay/codeCouponInfo.html",
                success: function (res) {
                    $(".m-code-success").addClass("show");
                },
                error: function () {}
            });
        },
        // 获取短信验证码;
        getSMS: function () {
            var self = this, o = self.info, c = self.config;
            if(c.isAjax) return;
            if(!self.tools.isMobile(o.mobile.val())){
                return M.tips("请输入正确的手机号码");
            }
            var params = JSON.stringify({mobile: o.mobile.val()});
            c.isAjax = true;
            M.ajax({
                url: "/pay/codeSMS.html",
                data: {data: params},
                success:function(res){
                    o.mobile.attr("disabled", "disabled");
                    o.getCode.html("<i></i>秒后可重发").addClass("ban").find("i").secondCountDown({
                        second: 59,
                        endcall: function () {
                            o.getCode.removeClass("ban").html("获取验证码");
                            o.mobile.removeAttr("disabled");
                        }
                    });
                },
                complete: function () {
                    c.isAjax = false;
                }
            });
        },
        // 领取优惠卷;
        getSubmit: function () {
            var self = this, o = self.info, c = self.config;
            if(c.isAjax) return;
            if(!self.tools.isMobile(o.mobile.val())){
                return M.tips("请输入正确的手机号码");
            }else if(!$.trim(o.code.val())){
                return M.tips("请输入短信验证码");
            }
            var params = JSON.stringify({mobile: o.mobile.val(), vcode: o.code.val()}); // 优惠卷id在node里;
            M.ajax({
                url: "/pay/codeCoupon.html",
                data: {data: params},
                success:function(res){
                    o.pop.addClass("show");
                    //console.log(res);
                },
                error: function (res) {
                    o.code.val("");
                    M.tips({body: res.msg, delay: 2000});
                },
                complete: function () {
                    c.isAjax = false;
                }
            });
        }
    };
    page.init();
});