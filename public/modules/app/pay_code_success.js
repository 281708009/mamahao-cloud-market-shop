// 扫码付-成功;
define(function (require, exports, module) {
    var page = {
        tools: {
            // 校验手机号码;
            isMobile: function(v){return !/^1{1,}[3,4,5,7,8]{1}\d{9}$/.test(v)?false:true;},
            // 获取url参数;
            search: function(v){var value = location.search.match(new RegExp("[\?\&]" + v + "=([^\&]*)(\&?)", "i"));return value ? decodeURIComponent(value[1]) : "";}
        },
        config: {
            params: M.url.query(),
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

            console.log(c);
            page.bindEvents();
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
                        second: 10,
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
                    console.log(res);
                },
                complete: function () {
                    c.isAjax = false;
                }
            });
        }
    };
    page.init();
});