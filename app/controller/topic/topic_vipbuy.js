//  会员购活动  controller;
var HttpClient = require("../../utils/http_client"),
    API = require("../../config/apiTopic"),
    crypto = require('../../utils/crypto');

var topicVipbuy = {
    config: {
        pug: "topic/vipbuy/"
    },
    index: function (req, res, next){
        res.render(topicVipbuy.config.pug + 'index');
    },
    v1021: function (req, res, next){
        res.render(topicVipbuy.config.pug + '2016/1021/index');
    }
};
module.exports = topicVipbuy;