/*
 * 登录逻辑 login.js
 * by xqs
 * */
define(function(require, exports, module) {
    var page = {
        config: {},
        init: function () {
            page.bindEvents();
        },
        bindEvents: function () {
            /*登录*/
            $('.js-login').on('click', page.login);
            $('.js-bind').on('click', page.bind);
            /*发送验证码*/
            $('.js-vcode, .js-bindVcode').on('click', page.getVCode);
        },
        /*获取验证码*/
        getVCode: function () {
            /*手机号必填*/
            var $form = $('.fm-login'),
                _mobile = $form.find(".js-mobile"),
                mobile_val = $.trim(_mobile.val());
            var mobile_reg = /^1[3,5,7,8]{1}\d{9}$/;
            if (!mobile_val || !mobile_reg.test(mobile_val)) {
                M.tips('请输入正确的手机号！');
                return false;
            }
            /*读秒操作*/
            var _this = $(this);
            if (_this.hasClass("ban")) return false;
            _this.addClass("ban");

            var wait = 60, //定义等待时长
                context = _this.text();
            timer(_this);
            function timer(obj) {
                if (wait == 0) {
                    obj.removeClass("ban").text(context);
                } else {
                    obj.text(wait + '秒后可重发');
                    wait--;
                    setTimeout(function () {
                        timer(obj);
                    }, 1000);
                }
            }

            var apiURL = _this.is('.js-vcode') ? '/api/sendMessage' : '/api/sendBindMessage';
            M.ajax({
                url: apiURL,
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
            var $form = $('.fm-login');
            if (!page.validate($form)) return false;
            M.ajax({
                url: '/api/login',
                data: $form.serialize(),
                success: function (res) {
                    if (res.success) {
                        M.tips({
                            body: '登录成功！',
                            callback: function () {
                                location.href = M.url.query('origin') || location.origin;
                            }
                        });
                    }
                }
            });
        },
        //绑定
        bind:function(){
            var $form = $('.fm-login');
            if (!page.validate($form)) return false;
            var formData = $form.serialize(), query_k = M.url.query('k');
            M.ajax({
                url: '/api/bind',
                data: query_k ? [formData, '&k=', query_k].join('') : formData,
                success: function (res) {
                    if (res.success) {
                        M.tips({
                            body: '绑定成功！',
                            callback: function () {
                                window.location.href = M.url.query('origin') || location.origin;
                            }
                        });
                    }
                }/*,
                error: function (res) {
                    if(res.error_code == 201 && res.msg == "绑定失败,此帐号已经绑定过其他的微信号，请更换手机号码！"){
                        location.href = "/activity/autologin/?origin=" + M.url.query('origin') || location.origin;
                    }else{
                        M.tips(res.msg);
                    }
                }*/
            });
        },
        /*校验表单输入*/
        validate: function (obj) {
            var check = true;
            var items = $(obj).find(':text,:password,[type="tel"],[type="email"],[type="number"],[type="date"],[type="search"],[type="time"],[type="url"]');
            $.each(items, function () {
                var _this = $(this), this_val = $.trim(_this.val()), this_type = _this.data('type');
                var tips = (_this.closest('li').find('em').text() || _this.data('name')).replace(/\s|\*|:|：/g, '');
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
                    case 'integer':
                        if (!/^\d{6}$/.test(this_val)) {
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
});