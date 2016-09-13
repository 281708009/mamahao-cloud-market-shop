
var test = {
    index: function (req, res, next) {
        res.render('test');
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
        new aliOSS().showBucket({
            success: function (data) {
                res.json(data);
            }
        });
    },
    uploadImage: function (req, res, next) {
        var aliOSS = require('../utils/ali-oss');
        new aliOSS().uploadImage(arguments);
    }
};

module.exports = test;