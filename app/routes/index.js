/**
 * 路由控制器
 */

var router = express.Router();
var auth = require("../middleware/auth");

var indexCtrl = require("../controller/index"),           //首页
    storeCtrl = require("../controller/store"),           //门店
    goodsCtrl = require("../controller/goods"),           //分类
    cartCtrl = require("../controller/cart"),             //购物车
    accountCtrl = require("../controller/account"),       //账户相关，登录等
    centerCtrl = require("../controller/center"),         //个人中心
    orderCtrl = require("../controller/order"),           //订单
    weChatCtrl = require("../controller/wechat");         //微信相关


/**
 * 网站主页
 */
router
    .get("/demo", indexCtrl.demo)  //demo
    .get("/", indexCtrl.index)
    .get("/index", indexCtrl.index);


/**
 * 门店
 */
router
    .get("/store", storeCtrl.index)
    .post("/api/storeList", storeCtrl.storeList)
    .post("/api/storeDetail", storeCtrl.storeDetail)
    .post("/api/myServerStore", storeCtrl.myServerStore)
    .post("/api/myShowStore", storeCtrl.myShowStore)
    .post("/api/myAddress", storeCtrl.myAddress)
    .all("/store/assess/:shopId", storeCtrl.storeAssess)
;

/**
 * 商品相关
 */
router
    .get("/goods", goodsCtrl.index)
    .get("/goods/brand", goodsCtrl.brand)
    .get("/goods/detail", goodsCtrl.detail)
    .get("/goods/qualityPic", goodsCtrl.qualityPic)

    .post("/api/goods_type", goodsCtrl.goodsType)
    .post("/api/goods_list", goodsCtrl.list)
    .post("/api/goodsTypeTree", goodsCtrl.getGoodsTypeTree)
    .post("/api/search", goodsCtrl.search)
    .post("/api/searchKeywordTips", goodsCtrl.searchKeywordTips)
    .post("/api/filter", goodsCtrl.filter)

    .post("/api/addToCart", goodsCtrl.addToCart)

;

/**
 * 购物车
 */
router
    .get("/cart", cartCtrl.index)
    .get("/pay/", cartCtrl.pay)
    .get("/pay/alipay/pay.htm", cartCtrl.payTips)
    .post("/api/settlement", cartCtrl.settlement)
    .post("/api/cart", cartCtrl.list)
    .post("/api/aliPay", cartCtrl.aliPay)
    .post("/api/wxPrePay", cartCtrl.wxPrePay)
    .post("/api/wxPay", cartCtrl.wxPay)
    .post('/api/cart/:option', cartCtrl.cartOption)
;


/**
 * 用户登录
 */
router
    .get("/login", accountCtrl.toLogin)
    .get("/account/bind", accountCtrl.toBind)
    .get("/logout", accountCtrl.logout)
    .post("/api/login", accountCtrl.doLogin)
    .post("/api/sendMessage", accountCtrl.sendMessage);


/**
 * 微信相关
 */
router
    .get("/wechat", weChatCtrl.toWechat)
    .get("/weixin/callback", weChatCtrl.wechatCallBack);


/*用户个人中心*/
router
    .get('/center', auth.requiredAuthentication, centerCtrl.index)
    .post('/api/address', centerCtrl.address)
    .post('/api/address_edit', centerCtrl.addressEdit)
    .post('/api/address_gps', centerCtrl.addressGPS)
    .post('/api/beans', centerCtrl.beans)
    .post('/api/integral', centerCtrl.integral)
    .post('/api/coupons', centerCtrl.coupons)
    .post('/api/address/save', centerCtrl.doAddressSave)   //保存或新增地址
    .post('/api/address/queryArea', centerCtrl.queryAddressArea)   //保存或新增地址
;


/*
 * 订单相关
 * */
router
    .post('/api/orders', orderCtrl.orders)
    .post('/api/order_express', orderCtrl.orderExpress)
    .post('/api/order_detail', orderCtrl.orderDetail)
    .post('/api/order_review', orderCtrl.orderReview)
    .post('/api/order_review_detail', orderCtrl.orderReviewDetail)
    .post('/api/order_result', orderCtrl.orderResult)
    .post('/api/order/:option', orderCtrl.orderOption)
;



module.exports = router;
