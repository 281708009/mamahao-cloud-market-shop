/**
 * 路由控制器
 */

var router = express.Router();
var auth = require("../middleware/auth");

var indexCtrl = require("../controller/index");
var storeCtrl = require("../controller/store");
var categoryCtrl = require("../controller/category");
var cartCtrl = require("../controller/cart");
var usersCtrl = require("../controller/users");
var wechateCtrl = require("../controller/wechat");


/**
 * 网站主页
 */
router
    .get("/",indexCtrl.index)
    .get("/index",indexCtrl.index);

/**
 * 门店
 */
router
    .get("/store", storeCtrl.index);

/**
 * 分类
 */
router
    .get("/category", categoryCtrl.index);

/**
 * 购物车
 */
router
    .get("/cart", cartCtrl.index);


/**
 * 用户登录
 */
router
    .get("/login", usersCtrl.toLogin)
    .post("/login", usersCtrl.doLogin)
    .all("/logout", usersCtrl.logout)
    .all("/sendMessage", usersCtrl.sendMessage);


/*用户个人中心*/
//router.get('/center',auth.requiredAuthentication,usersCtrl.center);
router
    .get('/center',auth.requiredAuthentication, usersCtrl.center.index);
router
    .post('/orders', usersCtrl.center.orders)
    .post('/address', usersCtrl.center.address)
    .post('/address/edit', usersCtrl.center.addressEdit)
    .post('/beans', usersCtrl.center.beans)
    .post('/integral', usersCtrl.center.integral)
    .post('/coupons', usersCtrl.center.coupons)
;


/**
 * 微信相关
 */
router
    .get("/wechat", wechateCtrl.toWechat)
    .get("/weixin/callback", wechateCtrl.wechatCallBack);


/*demo*/
router
    .get("/demo", usersCtrl.demo);

module.exports = router;