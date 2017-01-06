var HttpClient = require("../../utils/http_client"),
    API = require("../../config/apiTopic"),
    crypto = require('../../utils/crypto');

var topic = {
    index: function (req, res, next) {
        // 写入静态调试位置cookie;
        // var location = '{"lng":120.15507,"lat":30.274085,"areaId":"330105","province":"浙江省","city":"杭州市","district":"拱墅区","formattedAddress":"浙江省杭州市拱墅区米市巷街道杭州市人民政府"}';
        // var userinfo = {header:"", nickname:"", memberId:"", token:""};
        // $.extend(userinfo, req.query);
        // location = new Buffer(location).toString("base64");
        // // 定位信息;
        // res.cookie('mmh_app_location', location, {path: '/'});
        // // 用户信息;
        // var cryptoInfo = crypto.newCipher(JSON.stringify(userinfo));
        // res.cookie('mmh_app_user_info', cryptoInfo, {path: '/'});
        //
        // if(userinfo.memberId && userinfo.token){
        //     var user_session = {
        //         memberId: userinfo.memberId,
        //         token: userinfo.token
        //     };
        //     req.session.user = user_session;//设置当前用户到session
        // }
        //
        // log.info("userinfo--------->", JSON.stringify(userinfo));
        // log.info("mmh_app_location--------->", location);
        // log.info("mmh_app_user_info--------->", cryptoInfo);
        // log.info("session--------->", req.session.user);

        var userAgent = req.header("user-agent"),
            isWeChat = /micromessenger/gi.test(userAgent);

        res.render('topic/index', {wechat: isWeChat ? req.session.wechat_user : {}});
    }
};
module.exports = topic;