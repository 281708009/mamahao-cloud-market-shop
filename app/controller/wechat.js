//微信相关配置
var config = AppConfig.site.wechat,
    app_id = config.app_id,
    app_secret = config.app_secret;

// 微信授权和回调,引入OAuth并实例化
var OAuth = require('wechat-oauth'),
    client = new OAuth(app_id, app_secret);

var HttpClient = require("../utils/http_client"),
    crypto = require('../utils/crypto');

var weChat = {
    //微信获取openid回调
    callback: function (req, res, next) {
        //[url]http://m.mamhao.com/weixin/callback?code=031BUXN00zkzwC1upBN007xON00BUXN9&state=http%253A%252F%252Fm.mamhao.com%252F
        var code = req.query.code,
            originalUrl = req.session.wechat_auth_origin;

        log.info('[wechat callback originalUrl]--->', originalUrl);

        //主动授权的code是以snsapi_userinfo方式获取到的，理论上能确保拿到微信用户信息。
        client.getAccessToken(code, function (err, result) {
            log.info('[wechat authInfo]--->', err && JSON.stringify(err) || JSON.stringify(result));
            if (err) return res.render('error', {msg: err.name});

            var openid = result.data.openid;
            //cookie中存储openid(弃用，存在session中)
            //res.cookie('openId', openid, {path: '/'});

            //session中存储openid、access_token等信息
            req.session.wechat_auth = result.data;

            //获取用户信息
            client.getUser(openid, function (err, result) {
                log.info('[wechat userInfo by openid]--->', err && JSON.stringify(err) || JSON.stringify(result));
                if (err || result.errcode) return res.render('error', {msg: err.name || result.errmsg});
                var userInfo = result;
                log.info('[wechat userInfo]--->', JSON.stringify(userInfo));
                //拿到微信用户信息后，存储到session中，这儿应该要更新用户信息到数据库中
                if (userInfo) {
                    //这儿存储微信用户信息，主要是给绑定使用
                    req.session.wechat_user = userInfo;
                }
                res.redirect(originalUrl);
            });

        });
    }
};

module.exports = weChat;

