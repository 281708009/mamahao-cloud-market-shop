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
            var defaults = $.extend({}, req.query, {openId: openId, isWeChat: isWeChat, isAlipay: isAlipay, isMamahao: isMamahao});
            console.log(req.query.k);
            // 微信、支付宝调用查询接口;
            if(isWeChat || isAlipay){
                HttpClient.request(arguments, {
                    url: API.queryPosBarOrder,
                    data: {k: req.query.k},
                    success: function (data) {
                        $.extend(data, defaults);
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
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryPosBarOrder,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 扫码付，支付成功
    success: function (req, res, next) {
        res.render("pay/code_success");
    }
};
module.exports = payCode;