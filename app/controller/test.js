var crypto = require('../utils/crypto');
var test = {
    index: function (req, res, next) {
        var isMamahao = /mamhao|mamahao/gi.test(req.header("user-agent")),
            userInfo = req.cookies && req.cookies['mmh_app_user_info'],
            location = req.cookies && req.cookies['mmh_app_location'],
            d = req.query.d,
            b = req.query.b;

        if (userInfo) userInfo = crypto.newDecipher(userInfo);
        if (location) location = new Buffer(decodeURIComponent(location), "base64").toString();
        //log.info(location);
        if (d) d = crypto.newDecipher(d);
        if (b) b = new Buffer(decodeURIComponent(b), "base64").toString();

        log.info("test-------> userInfo", JSON.stringify(req.cookies));
        var defaults = $.extend({}, {location: location, isMamahao: isMamahao, userInfo: userInfo, d: d, b: b, cookies: req.cookies});
        res.render('test', defaults);
    },
    mongodb: function (req, res, next) {

        var useModel = require('../model/user')
        useModel.Find({
            "where": {
                "name": "jack"
            }
        }, function (err, data) {
            console.log('xxx--->', data)
            res.render('tools/result', {msg: JSON.stringify(data)});
        });
    },
    request: function (req, res, next) {
        var data = {
            id: 123,
            pid: 456
        };
       res.json(data);
    },
    aliOSS: function (req, res, next) {
        var aliOSS = require('../utils/ali-oss');
        new aliOSS().showBucket(arguments);
    },
    uploadImage: function (req, res, next) {
        var aliOSS = require('../utils/ali-oss');
        new aliOSS().uploadImage(arguments);
    },
    // 方便删除阶段清除相关数据
    remove: {
        cookie: function (req, res, next) {
            var cookies = req.cookies;
            for( key in cookies){
                res.clearCookie(key);
            }
            res.render('test/cookie', {cookies: cookies});
        }


    },
    sdk: function (req, res, next) {
        res.render('test/sdk');
    }
};

module.exports = test;