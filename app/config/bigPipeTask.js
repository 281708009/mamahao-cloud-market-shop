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
            blank: {style: '07', tips: '您还没有任何优惠券哦~'},
            data: {
                page: 1,
                pageSize: 20
            }
        },
        module: [
            {
                selector: ".list-0",
                data: {
                    status: 1   //未使用
                }
            },
            {
                selector: ".list-1",
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
                selector: ".list-0",
            },
            {
                selector: ".list-1",
                data: {
                    queryType: 3   //待付款
                }
            },
            {
                selector: ".list-2",
                data: {
                    queryType: 4   //待发货
                }
            },
            {
                selector: ".list-3",
                data: {
                    queryType: 5   //待收货
                }
            },
            {
                selector: ".list-4",
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
                selector: ".list-0",
                blank: {tips: '暂未获取到您的GoodBaby积分记录哦~'},
                data: {
                    type: 0   //GB
                }
            },
            {
                selector: ".list-1",
                blank: {tips: '暂未获取到您的Mothercare积分记录哦~'},
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
            //评论列表
            {
                selector: ".u-score",
                api: API.goodsCommentList,
                pug: '/lists/goods_comment_list.pug',
                blank: {style: '10', tips: '暂时还没有商品评论哦~'},
                data: {
                    page: 1,
                    pageSize: 10
                }
            },
            //SKU
            {
                selector: ".u-sku .content",
                api: API.querySku,
                pug: '/lists/goods_sku.pug'
            },
            //配送地址
            {
                selector: ".m-select-address .list",
                api: API.addressList,
                pug: '/lists/address.pug'
            }

        ]
    },
    // 猜你喜欢商品列表
    "orderResult": {
        common: {},
        module: [
            {
                selector: ".u-goods-list",
                api: API.queryWaitToCommentItems,
                pug: '/lists/tobe_comment.pug'
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
    },
    // 结算页 优惠券列表
    "settlement":{
        common:{},
        module: [
            {
                selector: ".more-coupon",
                api: API.queryStlOrderVouchers,
                pug: '/cart/coupon.pug',
            }
        ]
    },
    // 购物车页面 购物车商品列表,推荐商品列表
    "cart": {
        common: {},
        module: [
            {
                selector: ".cart-goods-module",
                api: API.cart,
                blank: {style: '06', tips: '还没给心爱的宝贝挑选几件中意的商品',btn:[{text:'逛逛首页',link:'/'}]},
                pug: '/cart/components/goods_list.pug'
            },
            {
                selector: ".cart-recommend-module",
                api: API.getRecommendList,
                pug: '/cart/components/recommend.pug',
                data: {
                    page: 1,
                    pageSize: 20
                }
            }
        ]
    },
    // 凑单页面
    supplement:{
        common:{
            api: API.getSupplementGoods,
            pug: '/lists/supplement.pug',
            blank: {style: '02', tips: '没有商品哦~'},
            data: {
                page: 1,
                pageSize: 20
            }
        },
        module:[

        ]
    },
    // 商品导购页
    guide: {
        common: {},
        module:[
            {
                selector: ".js-goods",
                api: API.queryItemPrice,
                pug: '/sale/components/guide_item.pug'
            },{
                selector: ".js-similar",
                api: API.monspGuideCheck,
                pug: '/sale/components/guide_similar.pug'
            },
            //SKU
            {
                selector: ".u-sku .content",
                api: API.querySku,
                pug: '/lists/goods_sku.pug'
            }
        ]
    }


};

module.exports = task;