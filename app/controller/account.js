var HttpClient = require("../utils/http_client"),
    API = require('../config/api'),
    crypto = require('../utils/crypto');

var Thenjs = require('thenjs');

/**
 * 登录相关处理
 */
var account = {
    /*到登录页*/
    toLogin: function (req, res, next) {
        if (req.session.user && req.session.user.memberId) {
            var redirectURL = '/';
            res.redirect(redirectURL);
        } else {
            //res.render('account/login', {title: "妈妈好微商城-登录"});
            res.render('account/prompt');
        }
    },
    // 绑定页面跳转;
    toBind: function (req, res, next) {
        var args = arguments;
        var params = req.query, pugPath = 'account/bind';
        var user_session = req.session.user;
        if (user_session && user_session.token) {
            // 已登录 - 跳转至用户中心;
            res.redirect('/center#/');
        } else {
            var isWeChat = /micromessenger/gi.test(req.header("user-agent"));
            if (isWeChat) {
                var wechat_user = req.session.wechat_user || {};
                var defaults = $.extend({}, params, {
                    openId: wechat_user.openid,
                    isWeChat: isWeChat,
                    nickName: wechat_user.nickname,
                    weChatHead: wechat_user.headimgurl
                });
                Thenjs(function (cont) {
                    if (params.k) {
                        HttpClient.request(args, {
                            url: API.couponinfo,
                            data: {k: params.k},
                            success: function (data) {
                                var json = $.extend({}, defaults, {couponInfo: data});
                                cont(null, json);
                            }
                        });
                    } else {
                        cont(null, defaults);
                    }
                }).then(function (cont, json) {
                    // 未登录;
                    if (params.type == "activity") {
                        pugPath = "account/activityBind";
                    }
                    res.render(pugPath, json);
                }, function (cont, err) {
                    err && log.error(err);
                });

            } else {
                // 非微信平台跳转至登录界面;
                res.redirect('/login/');
            }
        }
    },
    // 妈妈好内部登录跳转;
    toMamahao: function (req, res, next) {
        var mmh_user_info = req.cookies && req.cookies['mmh_app_user_info'];
        log.info("mmh_app_user_info--->", mmh_user_info);
        if (mmh_user_info) {
            var json = JSON.parse(crypto.newDecipher(mmh_user_info));
            if (json.memberId) {
                // 妈妈好端已登录;
                var user_session = $.extend(req.session.user, {
                    memberId: json.memberId,
                    token: json.token,
                    headPic: json.header,
                    memberNickName: json.nickname
                });
                req.session.user = user_session; //设置当前用户到session
                log.info("[登录成功后跳转至回调页面]：userInfo--->", req.query.origin);
                // 登录成功后跳转至回调页面;
                res.redirect(req.query.origin);
            } else {
                res.render("account/mmh_login", req.query);
            }
        } else {
            res.render("account/mmh_login", req.query);
        }
    },
    /*请求登录*/
    doLogin: function (req, res, next) {
        var mobile = req.body.mobile, vcode = req.body.vcode;
        var channelId = AppConfig.site.channel.id;
        HttpClient.request(arguments, {
            url: API.login,
            data: {
                phone: mobile,
                vcode: vcode,
                from: channelId
            },
            success: function (data, $data) {
                //登录成功设置session
                req.session.user = $data;//设置当前用户到session
                res.json({success: true, msg: "登录成功！"});
            }
        });
    },
    //绑定
    doBind: function (req, res, next) {
        var params = req.body,
            wechat_user = req.session.wechat_user || {};
        HttpClient.request(arguments, {
            url: API.bind,
            data: $.extend({}, params, {
                unionId: wechat_user.unionid,
                openId: wechat_user.openid,
                nickName: wechat_user.nickname,
                thirdHeadPic: wechat_user.headimgurl
            }),
            success: function (data, $data) {
                //绑定成功设置session
                req.session.user = $data;//设置当前用户到session
                res.json({success: true});
            }
        });
    },
    /*登出*/
    logout: function (req, res, next) {
        //清除session
        req.session.user = null;
        res.locals.success = "退出成功";
        res.redirect('/');
    },
    /*发送验证码*/
    sendMessage: function (req, res, next) {
        var mobile = req.body.mobile;
        HttpClient.request(arguments, {
            url: API.vcode,
            data: {
                phone: mobile
            },
            success: function (data) {
                res.json(data);
            }
        });
    },
    /*发送绑定验证码*/
    sendBindMessage: function (req, res, next) {
        var mobile = req.body.mobile;
        HttpClient.request(arguments, {
            url: API.bindVcode,
            data: {
                phone: mobile
            },
            success: function (data) {
                res.json(data);
            }
        });
    }
};

module.exports = account;
