/*
* 用户有关的处理
* */
var users = {
    /*
    * 首页
    * */
    index: function (req, res, next) {
        res.render('index');
    },
    /*
    * 登录
    * */
    login: function (req,res,next) {
        res.render('users/login', {title: 'login'});
    },
    /*
    * 用户中心
    * */
    center: function (req, res, next) {
        res.render('users/center',{info: 'xqs'});
    }
};

module.exports = users;