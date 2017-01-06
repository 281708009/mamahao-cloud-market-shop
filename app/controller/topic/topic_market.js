//  市场活动  controller;
var HttpClient = require("../../utils/http_client"),
    API = require("../../config/apiTopic"),
    crypto = require('../../utils/crypto');

var topicMarket ={
    config: {
        pug: "topic/market/"
    },
    index: function (req, res, next){
        res.render(topicMarket.config.pug + 'index');
    }
};
module.exports = topicMarket;