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
        res.render('account/bind');
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
                console.log('success---->' + JSON.stringify(data))
                // var json = JSON.parse(data);
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
    /*登出*/
    logout: function (req, res, next) {
        req.session.user = null;
        res.locals.success = "登录成功";
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
    }
};

module.exports = account;
