/*
 * 门店
 * */
var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api'),
    crypto = require('../utils/crypto');

var activity = {
    // 微信自动登录;
    autoLogin: function (req, res, next) {
        var openId = req.cookies && req.cookies['openId'],
            token = req.cookies && req.cookies['token'];
        log.info('[微信登录]：url==', req.originalUrl, '，openId==', openId, '，token==', token);
        //if(req.query.debug) return next();
        // 微信授权并尝试登录
        //未授权或者已授权但未绑定，这个地方得保证微信授权后到绑定页面成功在client设置cookie
        var originalUrl = req.query.origin;
        log.info("受权登录成功后跳转地址------>", originalUrl);
        var apiURL = AppConfig.site.wechat.apiURL; //apiURL
        var redirect_uri = encodeURIComponent(apiURL + 'V1/weixin/oauth/callback.htm?resource=1' + '&go=' + encodeURIComponent(originalUrl));   // 由于整个URL有点复杂，所以originalUrl 需要再次encodeURIComponent一下;
        var authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppConfig.site.wechat.app_id + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=12345465#wechat_redirect';
        return res.redirect(authUrl);
    },
    // 统一登录校验;
    auth: function (req, res, next) {
        var isWeChat = /micromessenger/gi.test(req.header("user-agent"));
        var user_session = req.session.user;
        if (user_session && user_session.token) {
            console.log("活动页面用户已登录------>", JSON.stringify(user_session));
            next();
        } else {
            console.log("活动页面用户未登录------>");
            if (isWeChat) {
                // 是微信浏览器;
                var href = '/account/bind/?type=activity';
                if(!req.query.origin){
                    var originalUrl = req.protocol + '://' + req.get('host') + req.url;
                    href += ["&origin=", encodeURIComponent(originalUrl)].join("");
                }
                res.redirect(href);
            } else {
                // 否部浏览器;
                res.redirect('/login/');
            }
        }
    },
    // 市场1001活动;
    act20161001: function (req, res, next) {
        console.log("url------>", req.url);
        console.log("cookie-openId---->", req.cookies['openId']);
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            openId = req.cookies && req.cookies['openId'],
            wxNickName = req.cookies['wxNickName'] && crypto.decipher(req.cookies['wxNickName']);
        var defaults = $.extend({}, {openId: openId, isWeChat: isWeChat, nickName: wxNickName});
        HttpClient.request(arguments, {
            url: API.activity.A20161001.start,
            success: function (data) {
                $.extend(data, defaults);
                res.render("activity/2016/1001/index", data);
            }
        });
        //res.render("activity/2016/1001/index");
    },
    // 投掷骰子
    act20161001Go: function (req, res, next) {
        var data = req.body,  // 请求参数值;
            params = {},
            openId = req.cookies['openId']; // 当前用户的openid;
        // openId 从他人分享地址进入时，投掷骰子后可以为他人增加一次次数;
        // 如果请求里的openid与当前用户id相同，那么不传openid参数;
        if(data.openId && openId){
            if(data.openId != openId){
                params.openId = crypto.decipher(data.openId);
            }
        }
        console.log("cookie-openId---->", openId);
        console.log("投掷骰子------>", JSON.stringify(params));
        HttpClient.request(arguments, {
            url: API.activity.A20161001.go,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 领取大奖
    act20161001getPrize: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.activity.A20161001.drawPrize,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 我的奖品记录
    act20161001PrizeList: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.activity.A20161001.myPrizeList,
            data: {actType: 5},
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 添加收货信息
    act20161001setInfo: function (req, res, next) {
        var params = req.body;  // 请求参数值;
        HttpClient.request(arguments, {
            url: API.activity.A20161001.saveMyPrize,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    }

};
module.exports = activity;