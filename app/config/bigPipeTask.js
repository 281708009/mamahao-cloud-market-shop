/*
 * bigPipe task
 * by xqs 160620
 * */
var API = require('../config/api');

/*配置bigPipe任务列表，对应多个模块,第一个任务必填，之后的任务可继承
 * @selector 模块的选择器
 * @api 后台api接口地址
 * @jade 模块对应的jade视图文件地址
 * @data 后台请求需要的参数
 * */
var task = {
    //优惠券
    "coupons": [
        {
            selector: ".list:eq(0)",
            api: API.coupons,
            jade: '/lists/coupon.jade',
            blank: {style: '07', tips: '您暂时还没有优惠劵哦~'},
            data: {
                page: 1,
                pageSize: 20,
                status: 1   //未使用
            }
        },
        {
            selector: ".list:eq(1)",
            data: {
                page: 1,
                pageSize: 20,
                status: 4   //已过期
            }
        }
    ],

};

module.exports = task;