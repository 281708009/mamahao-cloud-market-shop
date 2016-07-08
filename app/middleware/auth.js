/**
 * Created by Administrator on 2016/6/12.
 */
//登录验证
exports.requiredAuthentication = function(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        var validation = false;//验证是否是微信浏览器
        var userAgent = req.header("user-agent").toLowerCase();
        if (userAgent.indexOf("micromessenger") > 0) {// 是微信浏览器
            validation = true;
        }
        console.log("validation:"+validation);
        if(validation){
            res.redirect('/demo');
        }else{
            req.session.error = 'Access denied!';
            res.redirect('/login');
        }
    }
};