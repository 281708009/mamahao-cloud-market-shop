//  运营活动  controller;
var HttpClient = require("../../utils/http_client"),
    API = require("../../config/apiTopic"),
    crypto = require('../../utils/crypto');

var topicOpt = {
    config: {
        pug: "topic/opt/"
    },
    index: function (req, res, next){
        log.info(req.params.data);
        HttpClient.request(arguments, {
            type: "get",
            url: 'http://h5.mamahao.com/topic/2017/0102/01/index.json',
            success: function (data) {
                log.info(JSON.stringify(data));
                res.render(topicOpt.config.pug + 'index', data);
            }
        });
    },
    v1116: function (req, res, next){
        /*HttpClient.request(arguments, {
            url: API.queryItemPrice,
            data: {
                styleNumIds: '802399, 166042, 169377, 169376, 169375, 178520, 189901, 204124, 18944, 197386, 205946, 802432, 168178, 169602, 204122, 168603, 204127, 180911, 169454, 168597, 180913, 180912, 310452, 170821, 170852, 170855, 171978, 171979, 193452, 189610, 204140, 205370, 163357, 38795, 204361, 166090, 169076, 168647, 135138, 700049, 166022, 51032, 204439, 17824, 168194, 17826, 168190, 168196, 209920, 205391, 204427, 204478, 610188, 170845, 172065, 803845, 17952, 178490, 17960, 610223, 700327, 700328, 700329, 700330, 802445, 802453, 181709, 202342, 183497, 25946, 700405, 182972, 610218, 184782, 178201, 25832, 204416, 204396, 701117, 178212, 205323, 178496, 205230, 179552, 701313, 204809, 163344, 164531, 901512, 204594, 205564, 204467, 201297, 201299, 903787, 902491, 903884, 905537, 903808, 183478',
                //vipInfoShow: true,
                couponInfoShow: true
            },
            success: function (data) {
                log.info(data);
            }
        });*/
        res.render(topicOpt.config.pug + '2016/1116/index');
    }
};
module.exports = topicOpt;