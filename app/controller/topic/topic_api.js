var HttpClient = require("../../utils/http_client"),
    API = require('../../config/apiTopic');

var topicApi = {
    // 通用方法;
    common: {
        // 获取商品信息接口;
        goods: function (req, res, next) {
            var body = req.body, // 请求参数值;
                params = {};
            console.log("前端过来的参数-------->", JSON.stringify(body));
            // node 端简单的对请求数据进行校验过滤;
            // 商品id;
            if(body.node.id) params.styleNumIds = body.node.id;
            // 会员购信息;
            if(body.node.vip) params.vipInfoShow = true;
            // 促销信息;
            if(body.node.coupon) params.couponInfoShow = true;
            console.log("node处理后的参数-------->", JSON.stringify(params));

            HttpClient.request(arguments, {
                url: API.queryItemPrice,
                data: params,
                success: function (data) {
                    var rows = {
                        data: data,
                        views: body.views
                    };
                    res.render("topic/components/items.pug", rows, function (err, html) {
                        console.log(err);
                        res.json({template: html});
                    });
                }
            });
        },
        // 获取活动短信验证码
        sms: function (req, res, next) {
            var params = req.body;  // 请求参数值;
            HttpClient.request(arguments, {
                url: API.sendSmsVcodeForNoReg,
                data: params,
                success: function (data) {
                    res.json(data);
                }
            });
        }
    },
    // 目录结构;
    pug: {
        opt: "topic/opt/",
        vipbuy: "topic/vipbuy/",
        market: "topic/market/",
    },
    // 运营;
    opt:  {

    },
    // 会员GO;
    vipbuy: {

    },
    // 市场;
    market: {

    }
};
module.exports = topicApi;