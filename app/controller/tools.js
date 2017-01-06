var HttpClient = require("../utils/http_client"),
    API = require('../config/api');

var tools = {
    index: function (req, res, next) {
        res.render('tools/index');
    },
    //解除用户微信数据绑定
    unbind: function (req, res, next) {
        var params = req.query;
        HttpClient.request(arguments, {
            url: API.unbind,
            data: params,
            success: function (data) {
                res.render('tools/result', {msg: '解绑成功'});
            },
            error: function (data) {
                res.render('tools/result', {msg: '权限不足，暂不支持用户主动解绑'})
            }
        });
    },
    //清除用户缓存
    cleanCache: function (req, res, next) {
        //cookies
        var cookies = req.cookies;
        for (var key in cookies) {
            res.clearCookie(key);
        }

        //session
        var clean_session_keys = ['user', 'wechat_user', 'wechat_auth'];
        clean_session_keys.forEach(function (v, i) {
            req.session[v] = null;
        });

        res.render('tools/result', {msg: '已成功清除用户缓存'});
    }
};

module.exports = tools;