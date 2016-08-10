/**
 * 登录认证中间件
 */

//登录验证
exports.requiredAuthentication = function (req, res, next) {
    var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

    if (req.session.user) {
        next();
    } else {
        // 是微信浏览器
        if (/micromessenger/gi.test(req.header("user-agent"))) {
            res.redirect('/account/bind?origin=' + originalUrl);
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login?origin=' + originalUrl);
        }
    }
};