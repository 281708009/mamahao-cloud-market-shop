/*
* 门店扫码支付
* v1.0
* by Adang
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');
var request = require('request');
var bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask');

var payCode = {
    // 扫码付;
    index: function (req, res, next) {
        log.info('不走统一微信受权');
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            isAlipay = /alipayclient/gi.test(req.header("user-agent")),
            isMamahao = /mamhao/gi.test(req.header("user-agent")),
            scanCodeToken = req.cookies && req.cookies['scanCodeToken'],  // 图文验证码唯一参数
            cryptoOpenId = req.cookies && req.cookies['scanOpenId'];
        if(!cryptoOpenId && isWeChat){
            // 微信端需要做一个静默受权;
            var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
            var apiURL = AppConfig.site.wechat.apiURL; //apiURL
            var redirect_uri = encodeURIComponent(apiURL + 'V1/weixin/oauth/callback.htm?resource=3' + '&go=' + originalUrl); // resource=3  静默受权;
            var authUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + AppConfig.site.wechat.app_id + '&redirect_uri=' + redirect_uri + '&response_type=code&scope=snsapi_base&state=12345465#wechat_redirect';
            return res.redirect(authUrl);
        }else{
            var crypto = require('../utils/crypto'), openId = "";
            cryptoOpenId && (openId = crypto.decipher(cryptoOpenId)); // 如果有openId，就进行解密;
            var defaults = $.extend({}, req.query, {openId: openId, isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
            //var params = {k: decodeURIComponent(req.query.k)};
            var params = {k: req.query.k};
            // 如需图文验证码;
            req.query.vcode && $.extend(params, {vcode: req.query.vcode, scanCodeToken: scanCodeToken});
            log.info("扫码付请求的参数：" + JSON.stringify(params));
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
    // 订单支付页 - 防止H5广告问题;
    order: function (req, res, next) {
        log.info('不走统一微信受权,扫码付中转页面');
        var isWeChat = /micromessenger/gi.test(req.header("user-agent")),
            isAlipay = /alipayclient/gi.test(req.header("user-agent")),
            isMamahao = /mamhao/gi.test(req.header("user-agent")),
            scanCodeToken = req.cookies && req.cookies['scanCodeToken'];  // 图文验证码唯一参数
        var defaults = $.extend({}, req.query, {isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
        res.render("pay/code_over", defaults);
    },
    // 获取图片验证码;
    imageCode: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.imageVcode,
            success: function (data) {
                log.info("写图文验证码唯一码：" + data.scanCodeToken);
                res.cookie("scanCodeToken", data.scanCodeToken); // 写图文验证码唯一码;
                res.json({src: data.image});
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
        log.info("扫码付支付成功：" + JSON.stringify(defaults));
        res.render("pay/code_success", defaults);
    },
    // 获取短信验证码;
    sms: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.sendSmsVcodeForNoReg,
            data: params,
            success: function (data) {
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
    // 优惠卷信息;
    couponInfo: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, {tid: "57c69f230cf25161cf371ce8"}); // 优惠卷id;
        HttpClient.request(arguments, {
            url: API.checkObtainCoupon,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    }
};
module.exports = payCode;