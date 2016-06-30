
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
        res.render('test',data);
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