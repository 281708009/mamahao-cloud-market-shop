
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
            res.write('<script>console.log("bigPipe test...")</script>');
            res.end();
        });
    },
    request: function (req, res, next) {
        var data = {
            id: 123,
            pid: 456
        };
       res.json(data);
    }
};

module.exports = test;