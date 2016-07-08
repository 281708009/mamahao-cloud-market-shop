/**
 * 路由控制器
 */

var router = express.Router();
var auth = require("../middleware/auth");

var indexCtrl = require("../controller/index"),            //首页
    storeCtrl = require("../controller/store"),            //门店
    categoryCtrl = require("../controller/category"),     //分类
    cartCtrl = require("../controller/cart"),              //购物车
    accountCtrl = require("../controller/account"),       //账户相关，登录等
    centerCtrl = require("../controller/center"),         //个人中心
    weChatCtrl = require("../controller/wechat");         //微信相关


/**
 * 网站主页
 */
router
    .get("/demo", indexCtrl.demo)  //demo
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
    .get("/login", accountCtrl.toLogin)
    .get("/logout", accountCtrl.logout)
    .post("/api/login", accountCtrl.doLogin)
    .post("/api/sendMessage", accountCtrl.sendMessage);


/*用户个人中心*/
router
    .get('/center',auth.requiredAuthentication, centerCtrl.index)
    .post('/api/orders', centerCtrl.orders)
    .post('/api/address', centerCtrl.address)
    .post('/api/address_edit', centerCtrl.addressEdit)
    .post('/api/beans', centerCtrl.beans)
    .post('/api/integral', centerCtrl.integral)
    .post('/api/coupons', centerCtrl.coupons)
;


/**
 * 微信相关
 */
router
    .get("/wechat", weChatCtrl.toWechat)
    .get("/weixin/callback", weChatCtrl.wechatCallBack);


module.exports = router;