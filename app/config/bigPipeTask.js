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
    orders: [
        {
            selector: ".list:eq(0)",
            api: API.orderList,
            jade: '/lists/order.jade',
            blank: {style: '02', tips: '您还没有任何订单哦~'},
            data: {
                page: 1,
                count: 15
            }
        },
        {
            selector: ".list:eq(1)",
            data: {
                page: 1,
                count: 15,
                queryType: 3   //待付款
            }
        },
        {
            selector: ".list:eq(2)",
            data: {
                page: 1,
                count: 15,
                queryType: 4   //待发货
            }
        },
        {
            selector: ".list:eq(3)",
            data: {
                page: 1,
                count: 15,
                queryType: 5   //待收货
            }
        },
        {
            selector: ".list:eq(4)",
            data: {
                page: 1,
                count: 15,
                queryType: 6   //待评价
            }
        }
    ],
    //积分
    "integral": [
        {
            selector: ".list:eq(0)",
            api: API.integral,
            jade: '/lists/integral.jade',
            blank: {style: '04', tips: '您暂时还没有Goodbaby积分哦~'},
            data: {
                pageNo: 1,
                pageSize: 20,
                type: 0   //GB
            }
        },
        {
            selector: ".list:eq(1)",
            blank: {style: '04', tips: '您暂时还没有Mothercare积分哦~'},
            data: {
                pageNo: 1,
                pageSize: 20,
                type: 1   //MC
            }
        }
    ],

};

module.exports = task;