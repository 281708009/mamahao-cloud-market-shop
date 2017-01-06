/*
 * 服务端api接口列表
 * by xqs 160620
 * */

var api = {
    "queryMainPage": "V4/home/base/queryMainPage.htm",    // 首页
    "previewMainPage": "V4/home/base/previewMainPage.htm", // 首页预览接口
    "login": "V1/member/login.htm",    //登录
    "bind": "V2/weixin/oauth/bind.htm",    //绑定
    "unbind": "V2/weixin/oauth/unbind.htm",    //解除绑定
    "vcode": "V1/sms/vcode/sendSmsVcodeForLoginOrReg.htm",     //登录获取验证码
    "bindVcode": "V1/sms/vcode/sendSmsVcodeForBindMobile.htm",     //绑定获取验证码
    "verifyOpenId": "V1/weixin/oauth/verifyOpenId.htm",     //通过openid查询用户信息

    // 通用接口;
    "addMemberCollect": "V1/member/collect/addMemberCollect.htm", // 新增收藏（商品、品牌、门店）
    "deleteMemberCollect": "V1/member/collect/deleteMemberCollect.htm", // 删除收藏（商品、品牌、门店）

    "center": "V1/member/center/getMemberCenterCountInfo.htm",     //个人中心
    "profile": "V3/member/acct/user.htm",     //个人信息
    "profile_update": "V2/member/acct/nickname/update.htm",     //个人信息更新
    "profile_geo_update": "V2/member/acct/geo/update.htm",     //个人信息所在地区更新
    "breed_add": "V3/member/acct/breed/add.htm",     //个人信息添加
    "breed_update": "V3/member/acct/breed/update.htm",     //个人信息更新
    "breed_delete": "V3/member/acct/breed/delete.htm",     //个人信息删除

    "MBeanList": "V1/mbean/queryMBeanList.htm",     //获取妈豆记录
    "integral": "V1/member/center/queryMemberPoint.htm",     //积分
    "coupons": "V2/coupon/list.htm",     //优惠券
    "couponsReceive": "V2/coupon/obtain.htm",     //领券
    "couponsExchange": "V2/coupon/exchange.htm ",     //兑换券

    "addressList": "V1/member/delivery/getDeliveryAddr.htm",     //收货地址列表
    "checkArea": "V1/basic/checkArea.htm",     //地址
    "addAddress": "V1/member/delivery/addDeliveryAddr.htm",     //添加地址
    "updateAddress": "V1/member/delivery/updateDeliveryAddr.htm",     //更新地址
    "deleteAddress": "V1/member/delivery/delDeliveryAddr.htm",     //删除地址
    "queryArea": "V1/basic/queryArea.htm",     //获取省市区

    "orderList": "V3/order/basic/queryOrderList.htm",      // 订单列表
    //"orderDetail": "V2/order/basic/queryOrderDetail.htm",  // 订单详情
    "orderDetail": "V3/order/basic/queryOrderDetail.htm",  // 订单详情
    "orderDelete": "V1/order/basic/delOrder.htm",  // 删除订单请求
    "orderExpress": "V1/order/basic/getOrderLogisticsList.htm",    // 物流详情页
    "orderToPay": "V3/order/basic/toSettlement.htm",               // 立即付款
    "orderReview": "V1/order/basic/queryOrderGoodsList.htm",        // 评价晒单商品列表页面
    "orderRemind": "V1/order/basic/remindDelivery.htm",  // 提醒发货
    "orderReceive": "V1/order/basic/confirmReceipt.htm", // 确认收货
    "orderCancel": "V1/order/basic/cancelOrder.htm",   // 取消订单
    "getCancelCauses": "V1/common/attr/queryCommonAttr.htm",   //每月购 获取取消原因列表
    "orderByInspectCancel": "V1/order/basic/cancelOrderByInspect.htm", // 取消验货付款订单
    "orderIntercept":"V1/order/basic/interceptOrder.htm ",    // 取消发货
    "shopInfo": "V1/order/basic/queryShopInfo.htm",  // 获取门店信息
    "deliveryInfo": "V1/order/basic/queryDeliveryInfo.htm", // 获取配送信息
    //"reviewSubmit": "V2/comment/basic/commentGoodsTemplate.htm",    // 提交晒单评价
    "reviewSubmit": "V3/comment/basic/commentGoodsTemplate.htm", // [每月购] 提交晒单评价(每月购修改)

    "search": "V2/search/goods/list.htm", // 搜索
    "searchGoodsList": "V1/shop/basic/searchGoodsList.htm", // 搜索: 查询商品列表信息和获取门店商品列表
    "searchHotWords": "V1/client/search/getHotSearchWord.htm", // 搜索热词
    "searchKeywordTips": "V1/client/search/getKeywordTips.htm", // 搜索关键字提示
    "filterCategory": "V1/shop/basic/getGoodsListFilterForSearch.htm", // 筛选分类列表

    "goodsType": "V1/shop/basic/queryGoodsType.htm", // 商品分类：一级类目
    "goodsTypeTree": "V1/shop/basic/queryGoodsTypeTree.htm", // 商品分类：二级类目
    "goodsList": "V2/category/goods/list.htm", // 商品分类：二级类目商品列表
    "searchGoodsQuery": "V4/search/goods/query.htm", // 商品列表:类目、品牌、筛选、搜素共用


    //"goodsDetail": "V1/shop/basic/searchItemDetail.htm", // 商品详情: 切换规格
    //"goodsDetail": "V2/shop/basic/searchTemplateDetail.htm", // 商品详情
    "goodsDetail": "V3/goods/queryGoodsDetail.htm", // 详情页商品基本信息接口
    "goodsDetailExtra": "V3/goods/queryGoodsDetailExtInfo.htm", // 商品详情扩展信息接口
    "giftsList": "V1/promotion/queryGiftGoodsList.htm", // 赠品选择列表
    //"goodsCommentList": "V1/comment/basic/queryGoodsTemplateCommentList.htm", // 商品详情评论列表
    "goodsCommentList": "V2/goods/comment/querGoodsCommentList.htm", // 商品详情评论列表
    "goodsCommentChart": "V1/comment/basic/queryGoodsTemplateCommentChart.htm",
    "goodsParams": "V1/shop/basic/getGoodsParams.htm", // 商品参数详情
    "goodsContext": "V1/shop/basic/getGoodsStyleHtml.htm", // 商品图文详情
    "goodsProLableList": "V1/pmt/proLableList.htm", // 商品促销标签
    "goodsGuessYouLike": "V1/shop/basic/guessYouLike.htm", // 商品猜你喜欢
    "goodsCouponList": "V2/coupon/getGoodsCouponList.htm", // 商品优惠券列表
    "goodsPromotionList": "V2/promotion/queryPromotionList.htm", // 商品促销政策列表
    "goodsPromoteGroup": "V2/promotion/queryComboPromotionDetailList.htm", // 商品促销组合套餐列表
    "goodsQuery": "V1/goods/search/queryTemplateQADetail.htm", // 质检报告;

    "getSupplementGoods": "V1/goods/recommend/order/list.htm", // 凑单免运费商品列表

    "querySku": "V1/goods/sku/querySku.htm", //查询sku
    "addToCart": "V2/shop/cart/addCartItem.htm ", //加入购物车

    // 购物车模块
    "cart": "V2/shop/cart/getCart.htm",  //购物车列表
    "cartTopDesc": "V1/pmt/getCartTopDesc.htm",  //购物车顶部描述
    "getDefaultDeliveryAddr": "V2/member/delivery/getDefaultDeliveryAddr.htm",  // 获取用户默认收货地址
    "usefulCoupon": "V3/voucher/queryStlOrderVouchers.htm",  // 获取其他可用优惠券
    "cartItemCount": "V2/shop/cart/getCartItemCount.htm",  //获取购物车商品数量
    "selectedCart": "V2/shop/cart/selectedCart.htm",   // 购物车选择\取消选择商品
    "updateCartItemCount": "V2/shop/cart/updateCartItemCount.htm",  // 修改已选商品数量
    "removeCartItem": "V2/shop/cart/removeCartItem.htm",    // 删除购物车商品
    "getRecommendList": "V1/goods/recommend/cart/list.htm",  //购物车推荐商品列表
    "cleanCart": "V2/shop/cart/cleanCart.htm",  // 清除购物车商品
    "changeSKU": "V1/shop/cart/changeSKU.htm",   // 购物车切换sku

    // 结算
    "settlement": "V5/order/basic/toSettlement.htm",    // 获取结算信息
    //"check": "V2/order/basic/pay.htm", // 确认订单
    "check": "V3/order/basic/pay.htm", // 确认订单
    "pay": "V1/order/basic/pay2.htm",   // 订单 立即付款
    "checkoutByInspect": "V1/order/basic/inspectPay.htm",   // [每月购]验货付款确认订单
    "getCartWithInspect": "V1/order/cartPay/getCart.htm",   // [每月购] 验货付款订单确认收货
    "selectedCartWithInspect": "V1/order/cartPay/selectedCart.htm",    // [每月购] 验货付款确认收货时选择商品
    "updateCartItemCountWithInspect": "V1/order/cartPay/updateCartItemCount.htm",  // [每月购] 验货付款确认收货时修改商品数量
    "settlementByInspect": "V1/order/basic/toSettlementByInspect.htm", // [每月购] 验货付款确认收货获取结算信息
    "inspectConfirm": "V1/order/basic/inspectConfirm.htm",  // [每月购] 验货付款订单最终结算支付
    "checkPay": "V1/order/basic/checkPay.htm",     // 校验是否可以支付操作
    "aliPay": "pay/wapalipay/submit.htm",   // 阿里支付
    "wxPrePay": "pay/weixin/getOpenId.htm", // 微信预支付
    "wxPay": "pay/weixin/submit.htm",       // 微信确认支付
    "queryOrderState": "pay/weixin/queryOrderState.htm", // 微信二维码识别支付成功后跳转
    "submitInvoice": "V1/order/basic/addOrderInvoice.htm", // 提交发票信息
    "getExtraScore": "V1/order/basic/queryExtraScore.htm", // 获取可得妈豆积分数量
    "orderLock": "V1/order/basic/paylock.htm",  // 支付成功后锁定订单 不允许取消或删除订单
    "queryWaitToCommentItems": "V1/inspect/queryWaitToCommentItems.htm", // [每月购] 付款成功结果页获取待评价商品列表
    "commentGoodsTemplate": "V1/inspect/comment/commentGoodsTemplate.htm", // [每月购] 付款成功结果页提交商品评价
    "queryStlOrderVouchers":"V4/voucher/queryStlOrderVouchers.htm", // 获取结算推荐外的优惠券


    // 门店相关;
    "queryMemberShopIndex": "V1/member/shop/queryMemberShopIndex.htm", // 附近实体店首页
    "queryMemberServerShop": "V1/member/shop/queryMemberServerShop.htm", // 我的服务店
    "deletememberServiceShop": "V1/member/shop/deletememberServiceShop.htm", // 删除我的服务店
    "getMemberShopList": "V1/member/shop/getMemberShopList.htm", // 我关注的店
    "queryShopBasicInfo": "V1/shop/basic/queryShopBasicInfo.htm", // 获取门店基本详情
    "shopGoodsList": "V2/shop/goods/list.htm", // 门店商品列表
    "getDeliveryAddr": "V1/member/delivery/getDeliveryAddr.htm",  // 用户当前收货地址列表
    "getShopEvaluationInfo": "V1/shop/basic/getShopEvaluationInfo.htm",  // 获取门店评价详情
    // 摇妈豆;
    "getActiveMbeans": "V1/h5/base/getActiveMbeans.htm",    // 给自己摇妈豆
    "getActiveMbeansByExtApp": "V2/h5/base/getActiveMbeansByExtApp.htm",    // 给他人摇妈豆
    "getMbeanPossibleCount": "V3/h5/base/getMbeanPossibleCount.htm",    // 摇妈豆中奖列表


    // 扫码付;
    "queryPosBarOrder": "V1/order/basic/queryPosBarOrder.htm", // 扫码订单查询;
    "imageVcode": "vcode/verificationCode4ExtShare.htm", // 获取图片验证码;
    "sendSmsVcodeForNoReg": "V1/sms/vcode/sendSmsVcodeForNoReg.htm", // 外部活动获取短信验证码;
    "couponWithOther": "V1/cwo/couponWithOther.htm", // 外部领取优惠卷;
    "checkObtainCoupon": "V1/cwo/checkObtainCoupon.htm", // 外部优惠卷信息;

    // 每月购
    "queryMonspMainPage": "V1/monsp/queryMonspMainPage.htm",   // 每月购首页分组商品清单接口
    "queryMonspGroupNextPage": "V1/monsp/queryMonspGroupNextPage.htm",   // 每月购分组商品下一页列表
    "bottomBanner": "V1/monsp/bottomBanner.htm",   // 已选信息
    "addUnnecessaryGoods": "V1/monsp/addUnnecessaryGoods.htm",  // 用户商品屏蔽
    "couponinfo": "V1/wtg/couponinfo.htm",  // 获取优惠劵信息
    "monspGuideBody": "V1/monsp/guide/body.htm",  // 导购页图文详情
    "monspGuideCheck": "V1/monsp/guide/check.htm",  // 商品关联
    "queryItemPrice": "V4/h5/basic/queryItemPrice.htm"


};

module.exports = api;