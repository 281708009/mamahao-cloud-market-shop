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
        $('.js-submit').on('click', page.login);
        /*发送验证码*/
        $('.js-vcode').on('click', page.getVCode);
    },
    /*获取验证码*/
    getVCode: function () {
        /*手机号必填*/
        var _form = $("form"),
            _mobile = _form.find(".mobile"),
            mobile_val = $.trim(_mobile.val());
        var mobile_reg = /^1[3,5,7,8]{1}\d{9}$/;
        if (!mobile_val || !mobile_reg.test(mobile_val)) {
            M.tips('请输入正确的手机号！');
            return false;
        }
        /*读秒操作*/
        var _this = $(this);
        if (_this.hasClass("disabled")) return false;
        _this.addClass("disabled");

        var wait = 60, //定义等待时长
            context = _this.text();
        timer(_this);
        function timer(obj) {
            if (wait == 0) {
                obj.removeClass("disabled").text(context);
            } else {
                obj.text(wait + '秒后重发');
                wait--;
                setTimeout(function () {
                    timer(obj);
                }, 1000);
            }
        }

        M.ajax({
            url: '/sendMessage',
            data: {mobile: mobile_val},
            success: function (res) {
                if (res.success_code) {
                    M.tips('发送成功')
                } else {
                    M.tips(res.error)
                }
            }
        });
    },
    /*登录*/
    login: function () {
        if (!page.validate($('form'))) return false;
        M.ajax({
            url: '/login',
            data: $('form').serialize(),
            success: function (res) {
                if (res.success) {
                    location.href = M.url.query('origin') || location.origin;
                } else {
                    M.tips(res.msg);
                }
            }
        });
    },
    /*校验表单输入*/
    validate: function (obj) {
        var check = true;
        var items = $(obj).find(':text,:password,[type="tel"],[type="email"],[type="number"],[type="date"],[type="search"],[type="time"],[type="url"]');
        $.each(items, function () {
            var _this = $(this), this_val = $.trim(_this.val()), this_type = _this.data('type');
            var tips = _this.parent().find('label').text().replace(/\s|\*|:|：/g, '');
            if (this_val === '') {
                M.tips(tips + '不能为空！');
                return check = false;
            }

            switch (this_type) {
                case 'mobile':
                    if (!/^1[3,4,5,7,8]{1}\d{9}$/.test(this_val)) {
                        M.tips('请输入正确的' + tips);
                        return check = false;
                    }
                    break;
            }

        });
        return check;
    }
};

page.init();