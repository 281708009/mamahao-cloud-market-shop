var HttpClient = require("../utils/http_client");
var API = require('../config/api');

/**
 * 登录相关处理
 */
var account = {
    /*到登录页*/
    toLogin: function (req, res, next) {
        if (req.session.user) {
            var redirectURL = '/index';
            res.redirect(redirectURL);
        } else {
            res.render('account/login', {title: "妈妈好微商城-登录"});
        }
    },
    toBind: function (req, res, next) {
        var params = req.query;
        res.render('account/bind', params);
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
            success: function (data) {
                //登录成功设置session
                var user_session = {
                    id: data.memberId,
                    token: data.token,
                    nickname: data.memberNickName,
                    avatar: data.headPic
                };
                req.session.user = user_session;//设置当前用户到session
                res.json({success: true, msg: "登录成功！"});
            }
        });
    },
    //绑定
    doBind: function (req, res, next) {
        var params = req.body,
            cookiesParams = req.cookies ? {
                openId: req.cookies['openId'],
                unionId: req.cookies['unionId'],
                nickName: req.cookies['wxNickName']
            } : {};
        console.info("cookiesParams--->", $.extend({}, params, cookiesParams));
        HttpClient.request(arguments, {
            url: API.bind,
            data: $.extend({}, params, cookiesParams),
            success: function (data) {
                console.info("HttpClientsuccess--->", data);
                //设置cookie，这儿先注掉（不要动哈）
                var crypto = require('../utils/crypto');
                var cookie_setting = {path: '/'};
                res.cookie('head', crypto.cipher(data.headPic), cookie_setting);
                log.info("headPic--->", crypto.cipher(data.headPic));
                res.cookie('token', crypto.cipher(data.token), cookie_setting);
                log.info("token--->", crypto.cipher(data.token));
                res.cookie('memberId', crypto.cipher(data.memberId), cookie_setting);
                log.info("memberId--->", crypto.cipher(data.memberId));
                res.cookie('nick', crypto.cipher(data.memberNickName), cookie_setting);
                log.info("nick--->", crypto.cipher(data.memberNickName));

                //重新设置一下openId等cookie，保证时效一致
                res.cookie('openId', req.cookies['openId'], cookie_setting);
                res.cookie('unionId', req.cookies['unionId'], cookie_setting);
                res.cookie('wxNickName', req.cookies['wxNickName'], cookie_setting);
                //绑定成功设置session
                /*var user_session = {
                    id: data.memberId,
                    token: data.token,
                    nickname: data.memberNickName,
                    avatar: data.headPic
                };
                req.session.user = user_session;//设置当前用户到session
                console.info("user_session--->", user_session);*/
                res.json(data);

                /*res.json({success: true});*/
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
    },
    wxOauth: function (req, res, next) {
        var params = req.query;
        HttpClient.request(arguments, {
            url: API.wxOauth,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    }
};

module.exports = account;
