/*
 * 登录逻辑 login.js
 * by xqs
 * */
var page = {
    config: {},
    init: function () {
        page.bindEvents();
    },
    bindEvents: function () {
        /*登录*/
        $('.js-submit').on('click', function () {
            API.async({
                name: 'login',
                data: $('form').serialize(),
                success: function (res) {
                    if (res.success) {
                        location.href = M.url.query('origin') || location.origin;
                    } else {
                        M.tips(res.msg);
                    }
                }
            });
        });

        /*发送验证码*/
        $('.js-vcode').on('click', function () {
            var mobile = $.trim($(".mobile").val());
            API.async({
                name: 'vcode',
                data: {mobile: mobile},
                success: function (res) {
                    if (res.success_code) {
                        M.tips('发送成功')
                    } else {
                        M.tips(res.error)
                    }
                }
            });
        });
    }
};

page.init();