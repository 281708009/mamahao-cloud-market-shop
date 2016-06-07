var users = {
    index: function (req, res, next) {
        res.render('index');
    },
    login: function (req,res,next) {
        res.render('users/login', {title: 'login'});
    },
    center: function (req, res, next) {
        res.render('users/center',{info: 'xqs'});
    }
};

module.exports = users;