
var test = {
    index: function (req, res, next) {
        var isMamahao = /mamhao/gi.test(req.header("user-agent")),
            memberId = req.cookies && req.cookies['memberId'],
            token = req.cookies && req.cookies['token'];
        var defaults = $.extend({}, {token: token, memberId: memberId, isMamahao: isMamahao});
        res.render('test', defaults);
    },
    info: function (req, res, next) {
        console.log('id------>',req.params.id)
        var data = {
            id: req.params.id,
            pid: req.params.pid
        };
        res.render('test',data, function (err,html) {
            res.write(html);
            res.write('<script>function showInfo(info){console.log(info)}</script>');
            res.write('<script>showInfo("bigPipe test......")</script>');
            res.write('<script>console.log("bigPipe test2...")</script>');
            res.write('<script>console.log("bigPipe test3...")</script>');
            res.write('<script>console.log("bigPipe test4...")</script>');
            res.end();
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
    }
};

module.exports = test;