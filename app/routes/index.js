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
    payCodeCtrl = require("../controller/pay_code"),      //扫码支付
    weChatCtrl = require("../controller/wechat");         //微信相关

var ossCtrl = require("../controller/aliOSS");    //ali oss


/*
 * 扫码支付
 * 备注：不需要微信授权
 * */
router
    .get("/pay/code.html", payCodeCtrl.index)
    .get("/pay/codeOrder.html", payCodeCtrl.order)
    .get("/pay/codeSuccess.html", payCodeCtrl.success)
    .post("/pay/codeImageVcode.html", payCodeCtrl.imageCode)
    .post("/pay/codeSMS.html", payCodeCtrl.sms)
    .post("/pay/codeCoupon.html", payCodeCtrl.coupon)
    .post("/pay/codeCouponInfo.html", payCodeCtrl.couponInfo)
;


/**
 * 账户登录绑定相关
 * 备注：不需要微信授权
 */
router
    .get('/wxOauth', accountCtrl.wxOauth)
    .get("/login", accountCtrl.toLogin)
    .get("/account/bind", accountCtrl.toBind)
    .get("/logout", accountCtrl.logout)
    .post("/api/login", accountCtrl.doLogin)
    .post("/api/bind", accountCtrl.doBind)
    .post("/api/sendMessage", accountCtrl.sendMessage)
    .post("/api/sendBindMessage", accountCtrl.sendBindMessage)
;



/* ===================================================
* 所有路由先经过微信授权，优先级教高，放在路由的最前面
* ====================================================
* */


/**
 * 网站主页
 */
router
    .get("/demo", indexCtrl.demo)  //demo
    .get("/", weChatCtrl.auth, indexCtrl.index)
    .get("/index", weChatCtrl.auth, indexCtrl.index)
;


/**
 * 门店
 */
router
    .get("/store", weChatCtrl.auth, storeCtrl.index)
    .post("/api/storeList", storeCtrl.storeList)
    .post("/api/storeDetail", storeCtrl.storeDetail)
    .post("/api/myServerStore", storeCtrl.myServerStore)
    .post("/api/myShowStore", storeCtrl.myShowStore)
    .post("/api/myAddress", storeCtrl.myAddress)
    .post("/api/addCollect", storeCtrl.addCollect)
    .post("/api/delCollect", storeCtrl.delCollect)
    .post("/api/delServiceShop", storeCtrl.delServiceShop)
    .all("/store/assess/:shopId", weChatCtrl.auth, storeCtrl.storeAssess)
;

/**
 * 商品相关
 */
router
    .get("/goods", weChatCtrl.auth, goodsCtrl.index)
    .get("/goods/brand", weChatCtrl.auth, goodsCtrl.brand)
    .post("/api/goods_type", goodsCtrl.goodsType)
    .post("/api/goods_list", goodsCtrl.list)
    .post("/api/goodsTypeTree", goodsCtrl.getGoodsTypeTree)
    .post("/api/search", goodsCtrl.search)
    .post("/api/searchKeywordTips", goodsCtrl.searchKeywordTips)
    .post("/api/filter", goodsCtrl.filter)
    .post("/api/goods_detail", goodsCtrl.detail)
    .post("/api/goods_detail_extra", goodsCtrl.detailExtra)
    .post("/api/goods_quality", goodsCtrl.qualityPic)
    .post("/api/goods_promoteGroup", goodsCtrl.promoteGroup)
    .post("/api/goods_sku", goodsCtrl.sku)
    .post("/api/addToCart", goodsCtrl.addToCart)

;

/**
 * 购物车
 */
router
    .get("/cart", weChatCtrl.auth, cartCtrl.index)
    .get("/pay/", weChatCtrl.auth, cartCtrl.pay)
    .get("/pay/alipay/pay.htm", weChatCtrl.auth, cartCtrl.payTips)
    .get("/pay/result", weChatCtrl.auth, cartCtrl.payResult)
    .post("/api/pay/invoice", cartCtrl.submitInvoice)
    .post("/api/pay", cartCtrl.check)
    .post("/api/settlement", cartCtrl.settlement)
    .post("/api/cart", cartCtrl.list)
    .post("/api/aliPay", cartCtrl.aliPay)
    .post("/api/wxPrePay", cartCtrl.wxPrePay)
    .post("/api/wxPay", cartCtrl.wxPay)
    .post('/api/cart/:option', cartCtrl.cartOption)
    .post('/api/coupon', cartCtrl.coupon)
    .post('/api/checkpay', cartCtrl.checkPay)
;


/**
 * 微信相关
 */
router
    .get("/wechat", weChatCtrl.toWechat)
    .get("/weixin/callback", weChatCtrl.wechatCallBack)
;


/*用户个人中心*/
router
    .get('/center', weChatCtrl.auth, auth.requiredAuthentication, centerCtrl.index)
    .post('/api/address', centerCtrl.address)
    .post('/api/address_edit', centerCtrl.addressEdit)
    .post('/api/address_gps', centerCtrl.addressGPS)
    .post('/api/beans', centerCtrl.beans)
    .post('/api/integral', centerCtrl.integral)
    .post('/api/coupons', centerCtrl.coupons)
    .post('/api/coupons_exchange', centerCtrl.couponsExchange)
    .post("/api/coupons_receive", centerCtrl.couponsReceive)
    .post('/api/address/save', centerCtrl.doAddressSave)   //保存或新增地址
    .post('/api/address/delete', centerCtrl.doAddressDelete)   //删除地址
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
    .post('/api/order_rebuy', orderCtrl.orderRebuy)
;


/*
 * aliOSS文件上传
 * */
router
    .post('/oss/uploadFile', ossCtrl.uploadFile)
    .post('/oss/uploadImage', ossCtrl.uploadImage)
;


module.exports = router;
