/*
* 支付
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');
var Thenjs = require('thenjs');
var request = require('request');
var bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask');

var payCode = {
    // 扫码付;
    index: function (req, res, next) {
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            isAlipay = /alipayclient/gi.test(req.header("user-agent")),
            isMamahao = /mamhao/gi.test(req.header("user-agent")),
            openId = req.cookies && req.cookies['openId'];
        if(!openId && isWeChat){
            // 微信端需要做一个静默受权;
            var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            var baseUrl = 'http://' + AppConfig.site.api.host + AppConfig.site.api.root; //baseUrl
            var redirect_uri = encodeURIComponent(baseUrl + 'V1/weixin/oauth/callback.htm?resource=3' + '&go=' + originalUrl); // resource=3  静默受权;
            var authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppConfig.site.wechat.app_id + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=12345465#wechat_redirect';
            return res.redirect(authUrl);
        }else{
            var crypto = require('../utils/crypto');
            openId && (openId = crypto.decipher(openId)); // 如果有openId，就进行解密;
            var defaults = $.extend({}, req.query, {openId: openId, isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
            //var params = {k: decodeURIComponent(req.query.k)};
            var params = {k: req.query.k};
            // 如需图文验证码;
            req.query.vcode && $.extend(params, {vcode: req.query.vcode});
            console.log("扫码付获取过来的URL参数：" + JSON.stringify(params));
            // 微信、支付宝调用查询接口;
            if(isWeChat || isAlipay){
                HttpClient.request(arguments, {
                    url: API.queryPosBarOrder,
                    data: params,
                    success: function (data) {
                        $.extend(data, defaults, {shop: data.data[0]});
                        res.render("pay/code", data);
                    }
                });
            }else{
                res.render("pay/code", defaults);
            }
        }
    },
    // ajax获取数据;
    ajax: function (req, res, next) {
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            isAlipay = /alipayclient/gi.test(req.header("user-agent")),
            isMamahao = /mamhao/gi.test(req.header("user-agent")),
            openId = req.cookies && req.cookies['openId'];
        var defaults = $.extend({}, req.query, {openId: openId, isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryPosBarOrder,
            data: params,
            success: function (data) {
                console.log(data);
                $.extend(data, defaults, {shop: data.data[0]});
                res.render("pay/code", data, function (err, html) {
                    console.log(err);
                    res.json({template: html});
                });
                //res.render("pay/code", data);
                //res.json(data);
            }
        });
    },
    // 扫码付，支付成功
    success: function (req, res, next) {
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            isAlipay = /alipayclient/gi.test(req.header("user-agent")),
            isMamahao = /mamhao/gi.test(req.header("user-agent")),
            openId = req.cookies && req.cookies['openId'];
        var defaults = $.extend({}, req.query, {openId: openId, isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
        res.render("pay/code_success", defaults);
    },
    // 获取短信验证码;
    sms: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.sendSmsVcodeForNoReg,
            data: params,
            success: function (data) {
                console.log(data);
                res.json(data);
            }
        });
    },
    // 领取优惠卷
    coupon: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, {tid: "57c69f230cf25161cf371ce8"}); // 优惠卷id;
        HttpClient.request(arguments, {
            url: API.couponWithOther,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 测试;
    checkSessionRefresh: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.checkSessionRefresh,
            success: function (data) {
                console.log(data);
            }
        });
    },
    // 测试;
    reCheckSessionRefresh: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.reCheckSessionRefresh,
            success: function (data) {
                console.log(data);
            }
        });
    }
};
module.exports = payCode;