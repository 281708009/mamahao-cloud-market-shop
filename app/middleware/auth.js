/**
 * 登录认证中间件
 */

//登录验证
exports.requiredAuthentication = function (req, res, next) {
    log.info('auth.requiredAuthentication..........');
    var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var isWeChat = /micromessenger/gi.test(req.header("user-agent"));

    var user_session = req.session.user;

    if (user_session && user_session.token) {
        next();
    } else {
        if (isWeChat) {
            // 是微信浏览器
            res.redirect('/account/bind?origin=' + originalUrl);
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login?origin=' + originalUrl);
        }
    }
};