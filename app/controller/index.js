var HttpClient = require("../utils/http_client");
var logger = require("../utils/log").logger;
/**
 * 首页有关的处理
 * @param req
 * @param res
 * @param next
 */

exports.index = function (req, res, next) {
    HttpClient.request(arguments,{
        type:'get',
        url:'/V2/member/acct/anonymous/user.htm',
        data:{
            memberId:253654
        },
        success:function (data) {
            logger.debug("success:"+JSON.stringify(data));
        },
        error:function (err) {
            logger.error("error:"+err);
        }
    });
    logger.debug("debug");
    logger.info("info");
    logger.warn("warn");
    logger.error("error");
    res.render("index",{title:"首页"});
}