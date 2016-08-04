/*
 * bigPipe task
 * by xqs 160620
 * */
var API = require('../config/api');

/*配置bigPipe任务列表，对应多个模块,第一个任务必填，之后的任务可继承
 * @selector 模块的选择器
 * @api 后台api接口地址
 * @pug 模块对应的pug视图文件地址
 * @data 后台请求需要的参数
 * */
var task = {
    //优惠券
    "coupons": {
        common: {
            api: API.coupons,
            pug: '/lists/coupon.pug',
            blank: {style: '07', tips: '您暂时还没有优惠劵哦~'},
            data: {
                page: 1,
                pageSize: 20
            }
        },
        module: [
            {
                selector: ".list:eq(0)",
                data: {
                    status: 1   //未使用
                }
            },
            {
                selector: ".list:eq(1)",
                data: {
                    status: 4   //已过期
                }
            }
        ]
    }
    ,
    orders: {
        common: {
            api: API.orderList,
            pug: '/lists/order.pug',
            blank: {style: '02', tips: '您还没有任何订单哦~'},
            data: {
                page: 1,
                count: 10
            }
        },
        module: [
            {
                selector: ".list:eq(0)",
            },
            {
                selector: ".list:eq(1)",
                data: {
                    queryType: 3   //待付款
                }
            },
            {
                selector: ".list:eq(2)",
                data: {
                    queryType: 4   //待发货
                }
            },
            {
                selector: ".list:eq(3)",
                data: {
                    queryType: 5   //待收货
                }
            },
            {
                selector: ".list:eq(4)",
                data: {
                    queryType: 6   //待评价
                }
            }
        ]
    },
    //积分
    "integral": {
        common: {
            api: API.integral,
            pug: '/lists/integral.pug',
            blank: {style: '04'},
            data: {
                pageNo: 1,
                pageSize: 20
            }
        },
        module: [
            {
                selector: ".list:eq(0)",
                blank: {tips: '您暂时还没有Goodbaby积分哦~'},
                data: {
                    type: 0   //GB
                }
            },
            {
                selector: ".list:eq(1)",
                blank: {tips: '您暂时还没有Mothercare积分哦~'},
                data: {
                    type: 1   //MC
                }
            }
        ]
    },
    //商品分类首页
    "goods": {
        common: {},
        module: [
            {
                selector: ".category .nav",
                api: API.goodsType,
                pug: '/lists/goods_type.pug'
            },
            {
                selector: ".category .list",
                api: API.goodsTypeTree,
                pug: '/lists/goods_type_detail.pug',
                blank: {style: '04', tips: '还没有商品分类哦~'},
                data: {
                    typeId: 0   //第一个分类下的列表
                }
            }
        ]
    },
    //商品详情页
    "goodsDetail": {
        common: {},
        module: [
            //评分统计
            {
                selector: ".u-score .out",
                api: API.goodsCommentChart,
                pug: '/lists/goods_comment_chart.pug'
            },
            //商品参数
            {
                selector: "#swipe-detail .config",
                api: API.goodsParams,
                pug: '/lists/goods_params.pug'
            },
            //评论列表
            {
                selector: ".u-score .list",
                api: API.goodsCommentList,
                pug: '/lists/goods_comment_list.pug',
                blank: {style: '10', tips: '暂时还没有商品评论哦~'},
                data: {
                    page: 1,
                    pageSize: 2
                }
            }
        ]
    },
    // 猜你喜欢商品列表
    "orderResult": {
        common: {},
        module: [
            {
                selector: ".u-goods-list",
                api: API.goodsGuessYouLike,
                pug: '/lists/goods.pug'
            }
        ]
    },
    // 门店详情
    "storeDetail": {
        common: {},
        module: [
            {
                selector: ".node-stores-detail-info",
                api: API.queryShopBasicInfo,
                pug: '/store/components/detailInfo.pug'
            }
        ]
    }



};

module.exports = task;