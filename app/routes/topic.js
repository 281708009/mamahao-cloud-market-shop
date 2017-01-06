/**
 * 运营活动路由控制器
 */

var topic = express.Router();
var OAuth = require("../middleware/oauth");

var weChatCtrl = require("../controller/wechat"),                 //受权相关控制器
    topicCtrl = require("../controller/topic/topic"),             //页面公用访问控制器
    topicOptCtrl = require("../controller/topic/topic_opt"),      //运营活动控制器
    topicVipbuyCtrl = require("../controller/topic/topic_vipbuy"),//会员购活动控制器
    topicMarketCtrl = require("../controller/topic/topic_market"),//会员购活动控制器
    topicApiCtrl = require("../controller/topic/topic_api");      //api控制器


// 页面访问路由;
topic
    .get('/topic/', OAuth.authentication, topicCtrl.index)
;
// 运营;
topic
    .get('/opt/:data?', OAuth.authentication, topicOptCtrl.index)
    .get('/opt/2016/1116', OAuth.authentication, topicOptCtrl.v1116)
;
// 会员GO;
topic
    .get('/vipbuy/2016/1021', OAuth.authentication, topicVipbuyCtrl.v1021)
;
// 市场;
topic
    .get('/market/', OAuth.authentication, topicMarketCtrl.index)
;



// API通用路由;
topic
    .post('/api/topic/common/goods/', topicApiCtrl.common.goods)
    .post('/api/topic/common/sms/', topicApiCtrl.common.sms)
;
// API运营;
topic
    .post('/api/opt/')
;
// API会员GO;
topic
    .post('/api/vipbuy/')
;
// API市场;
topic
    .post('/api/market/')
;

module.exports = topic;