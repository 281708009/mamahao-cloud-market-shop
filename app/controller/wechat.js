//微信相关
var config_wechat = AppConfig.site.wechat;
var domain = config_wechat.domain;
var app_id = config_wechat.app_id;
var app_secret = config_wechat.app_secret;

// 微信授权和回调
var OAuth = require('wechat-oauth');
var client = new OAuth(app_id, app_secret);
var request = require('request');

var weChat = {
    //获取微信code
    toWechat: function (req, res, next) {
        var url = client.getAuthorizeURL('http://' + domain + '/weixin/callback', '', 'snsapi_base');
        console.log("wechat url:" + url);
        res.redirect(url)
    },
    //微信获取openid回调
    wechatCallBack: function (req, res, next) {
        console.log('----weixin callback -----')
        var code = req.query.code;
        client.getAccessToken(code, function (err, result) {
            console.dir(err)
            console.dir(result)
            var accessToken = result.data.access_token;
            var openid = result.data.openid;
            console.log('token=' + accessToken);
            console.log('openid=' + openid);
            //根据openid查找用户是否注册，如果注册就自动登录，如果未注册，就跳转到手机号码绑定页面
            res.redirect("/");
        });
    },
    //微信授权
    auth: function (req, res, next) {
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            openId = req.cookies && req.cookies['openId'];

        if (isWeChat && !openId) {
            var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            var baseUrl = 'http://' + AppConfig.site.api.host + AppConfig.site.api.root; //baseUrl
            var redirect_uri = encodeURIComponent(baseUrl + '/V1/weixin/oauth/callback.htm?resouce=1' + '&go=' + encodeURIComponent(originalUrl));
            var authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppConfig.site.wechat.app_id + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=12345465#wechat_redirect';
            return res.redirect(authUrl);
        }
        next();
    }
};

module.exports = weChat;

