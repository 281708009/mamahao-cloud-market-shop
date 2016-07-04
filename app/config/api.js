/*
 * 服务端api接口列表
 * by xqs 160620
 * */

var api = {
    "login": "/V1/member/login.htm",    //登录
    "vcode": "/V1/sms/vcode/sendSmsVcodeForLoginOrReg.htm",     //获取验证码
    "center": "/V1/member/center/getMemberCenterCountInfo.htm",     //个人中心
    "MBeanList": "/V1/mbean/queryMBeanList.htm",     //获取妈豆记录
    "MemberPoint": "/V1/member/center/queryMemberPoint.htm",     //分员积分
    "coupons": "/V2/coupon/list.htm",     //分员积分
    "orderList": "/V3/order/basic/queryOrderList.htm",     //订单地址列表
    "addressList": "/V1/member/delivery/getDeliveryAddr.htm",     //收货地址列表
    "checkArea": "/V1/basic/checkArea.htm",     //地址
    "addAddress": "/V1/member/delivery/addDeliveryAddr.htm",     //添加地址
    "updateAddress": "/V1/member/delivery/updateDeliveryAddr.htm",     //更新地址
};

module.exports = api;