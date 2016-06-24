/*
 * 服务端api接口列表
 * by xqs 160620
 * */

var api = {
    "login": "/V1/member/login.htm",    //登录
    "vcode": "/V1/sms/vcode/sendSmsVcodeForLoginOrReg.htm",     //获取验证码
    "MBeanList": "/V1/mbean/queryMBeanList.htm",     //获取妈豆记录
    "MemberPoint": "/V1/member/center/queryMemberPoint.htm	",     //分员积分
};

module.exports = api;