/**
 * 路由控制器
 */

var router = express.Router();
var OAuth = require("../middleware/oauth");

var indexCtrl = require("../controller/index"),           //首页
    storeCtrl = require("../controller/store"),           //门店
    goodsCtrl = require("../controller/goods"),           //分类
    cartCtrl = require("../controller/cart"),             //购物车
    accountCtrl = require("../controller/account"),       //账户相关，登录等
    centerCtrl = require("../controller/center"),         //个人中心
    orderCtrl = require("../controller/order"),           //订单
    payCodeCtrl = require("../controller/pay_code"),      //扫码支付
    weChatCtrl = require("../controller/wechat"),         //微信相关
    saleCtrl = require("../controller/sale"),             //会员购
    settlementCtrl = require("../controller/settlement"); //结算

var ossCtrl = require("../controller/aliOSS");    //ali oss


/*
 * 扫码支付
 * 备注：不需要微信授权
 * */
router
    .get("/pay/code.html", payCodeCtrl.oauth, payCodeCtrl.index)
    .get("/pay/codeSuccess.html", payCodeCtrl.success)
    .post("/pay/codeImageVcode.html", payCodeCtrl.imageCode)
    .post("/pay/codeSMS.html", payCodeCtrl.sms)
    .post("/pay/codeCoupon.html", payCodeCtrl.coupon)
    .post("/pay/codeCouponInfo.html", payCodeCtrl.couponInfo)
;


/**
 * 账户登录相关
 * 备注：绑定界面需要先微信授权
 */
router
    .get("/login", accountCtrl.toLogin)
    .get("/account/bind", OAuth.authentication, accountCtrl.toBind)
    .get("/login/mamahao", accountCtrl.toMamahao)
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
    .get("/", OAuth.authentication, indexCtrl.index)
    .get("/index", OAuth.authentication, indexCtrl.index)
    .get("/beans", OAuth.authentication, indexCtrl.beans)
    .get("/im/im.html", OAuth.authentication, indexCtrl.im)
    .get("/routes/", indexCtrl.routes) //js sdk空页面

    .post("/api/shakeBeans", indexCtrl.shakeBeans)
;


/**
 * 购物车
 */
router
    .get("/cart", OAuth.authentication, cartCtrl.index)
    .get("/pay/", OAuth.authentication, cartCtrl.pay)
    .get("/pay/alipay/pay.htm", OAuth.authentication, cartCtrl.payTips)
    .get("/pay/result", OAuth.authentication, cartCtrl.payResult)
    .post("/api/pay/invoice", cartCtrl.submitInvoice)
    .post("/api/pay", cartCtrl.check)
    .post("/api/cart", cartCtrl.list)
    .post('/api/cart/opt/:option', cartCtrl.cartOption)
    .post('/api/cart/changeSKU', cartCtrl.changeSKU)
    .post('/api/cart/getRecommendList', cartCtrl.getRecommendList)
    .post("/api/aliPay", cartCtrl.aliPay)
    .post("/api/wxPrePay", cartCtrl.wxPrePay)
    .post("/api/wxPay", cartCtrl.wxPay)
    .post('/api/coupon', cartCtrl.coupon)
    .post("/api/queryOrderState", cartCtrl.queryOrderState)
    .post('/api/checkpay', cartCtrl.checkPay)
    .post("/api/order/pay", cartCtrl.checkByInspect)
;

/**
 * 结算页
 */
router
    .get("/settlement/", OAuth.authentication, OAuth.login, settlementCtrl.index)
    .post("/api/inspectSettlement", settlementCtrl.inspect)
    .post("/api/settlement", settlementCtrl.settlement)
    .post("/api/isSupportInspect", settlementCtrl.isSupportInspect)
    .post("/api/checkoutByInspect", settlementCtrl.checkout)
    .post("/api/order_cart", settlementCtrl.getOrderCart)
    .post("/api/order_cart/opt/:option", settlementCtrl.cartOption)
    .post("/api/getTobeCommentList", settlementCtrl.getTobeCommentList)
    .post("/api/commentGoodsTemplate", settlementCtrl.commentGoodsTemplate)
    .post("/api/queryStlOrderVouchers", settlementCtrl.queryStlOrderVouchers)

;

/**
 * 门店
 */
router
    .get("/store", OAuth.authentication, storeCtrl.index)
    .post("/api/storeList", storeCtrl.storeList)
    .post("/api/storeDetail", storeCtrl.storeDetail)
    .post("/api/myServerStore", storeCtrl.myServerStore)
    .post("/api/myShowStore", storeCtrl.myShowStore)
    .post("/api/myAddress", storeCtrl.myAddress)
    .post("/api/addCollect", storeCtrl.addCollect)
    .post("/api/delCollect", storeCtrl.delCollect)
    .post("/api/delServiceShop", storeCtrl.delServiceShop)
    .all("/store/assess/:shopId", OAuth.authentication, storeCtrl.storeAssess)
;

/**
 * 商品相关
 */
router
    .get("/goods", OAuth.authentication, goodsCtrl.index)
    .get("/goods/brand", OAuth.authentication, goodsCtrl.brand)
    .get("/goods/group", goodsCtrl.group)
    .get("/goods/detail", OAuth.authentication, goodsCtrl.detail)
    .get("/goods/quality_report", goodsCtrl.qualityReport)
    .get("/goods/gifts", goodsCtrl.gifts)
    .get("/goods/supplement", goodsCtrl.supplement)

    .post("/api/goods_supplement", goodsCtrl.getSupplementList)
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
    .post("/api/goods_guessYouLike", goodsCtrl.guessYouLike)

;


/**
 * 微信相关
 */
router
    .get("/weixin/callback", weChatCtrl.callback)
;


/*用户个人中心*/
router
    .get('/center', OAuth.authentication, OAuth.login, centerCtrl.index)
    .get('/center/identity', OAuth.authentication, OAuth.login, centerCtrl.identity)

    .post('/api/center', centerCtrl.center)
    .post('/api/profile', centerCtrl.profile)
    .post('/api/profile_edit', centerCtrl.profileEdit)

    .post('/api/update_profile_cache', centerCtrl.updateProfileCache)
    .post('/api/profile_update', centerCtrl.profileUpdate)
    .post('/api/profile_geo_update', centerCtrl.profileGeoUpdate)
    .post('/api/breed_add', centerCtrl.breedAdd)
    .post('/api/breed_update', centerCtrl.breedUpdate)
    .post('/api/breed_delete', centerCtrl.breedDelete)


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
    //.get("/order/result.htm", OAuth.authentication, orderCtrl.result)
    .get("/order/settlement.htm", OAuth.authentication, OAuth.login, orderCtrl.settlement)
    .post('/api/order_query_causes', orderCtrl.getCauses)

;


/*
 * aliOSS文件上传
 * */
router
    .post('/oss/uploadFile', ossCtrl.uploadFile)
    .post('/oss/uploadImage', ossCtrl.uploadImage)
;


/*
 * 会员购
 * */
router
    .get('/sale/', OAuth.authentication, saleCtrl.index)
    .get('/sale/guide/', OAuth.authentication, saleCtrl.guide) // 商品导购页
    .all('/sale/similar/', saleCtrl.similar)
    .get('/sale/cover/', saleCtrl.cover)    // 封面预览;


    .post('/api/sale/group_page/', saleCtrl.groupPage) // 清单分页数据
    .post('/api/sale/guide_check/', saleCtrl.guideCheck)
    .post('/api/sale/guide_items/', saleCtrl.guideItems)
    .post('/api/sale/goods_shield/', saleCtrl.shield) // 屏蔽内容
    .post('/api/sale/goods_total/', saleCtrl.total)  // 清单小计
;

module.exports = router;
