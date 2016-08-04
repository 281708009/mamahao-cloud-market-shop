/**
 * Created by Administrator on 2016/6/12.
 */
//登录验证
exports.requiredAuthentication = function (req, res, next) {
    var originalUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    if (req.session.user) {
        next();
    } else {
        var isWeChat = false;//验证是否是微信浏览器
        var userAgent = req.header("user-agent");
        if (/micromessenger/gi.test(userAgent)) {// 是微信浏览器
            isWeChat = true;
        }
        if (isWeChat) {
            res.redirect('/account/bind?origin=' + originalUrl);
        } else {
            req.session.error = 'Access denied!';
            res.redirect('/login?origin=' + originalUrl);
        }
    }
};