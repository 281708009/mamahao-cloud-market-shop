var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api');

var order = {
    /* 订单列表 */
    orders: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        if (params.ajax) {
            //来源为分页请求
            HttpClient.request(arguments, {
                url: API.orderList,
                data: params,
                success: function (data) {
                    data.request = params;
                    res.render('lists/order', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        } else {
            var task = bigPipeTask.orders;

            bigPipe.prototype.succeed = function () {
                var me = this;
                res.render('order/index', {}, function (err, html) {
                    var template = html + me.scripts.join('');
                    res.json({template: template});
                });
            };

            new bigPipe(task, arguments);
        }

    },
    /* 订单详情 */
    orderDetail: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.orderDetail,
            data: params,
            success: function (data) {
                var json = {
                    detail: data
                };
                res.render('order/detail', json, function (err, html) {
                    err && console.error(err);
                    res.json({template: html});
                });
            }
        });
    },
    /* 再次购买 */
    orderRebuy: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.orderDetail,
            data: params,
            success: function (data) {
                var json = data;
                res.render('order/rebuy', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /* 订单物流详情 */
    orderExpress: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.orderExpress,
            data: params,
            success: function (data) {
                var json = data;
                res.render('order/express', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /* 订单评价 */
    orderReview: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.orderReview,
            data: params,
            success: function (data) {
                var json = data;
                res.render('order/review', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /* 订单相关操作 删除订单/提醒发货/ */
    orderOption: function(req, res, next){
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API[req.params.option],
            data: params,
            success: function (data) {
                if (data.success_code === 200) {
                    data.success = true;
                }
                res.json(data);
            }
        });
    },
    /* 订单评价详情 */
    orderReviewDetail:function(req, res, next){
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.orderReview,
            data: params,
            success: function (data) {
                var json = $.extend(data,{itemId:params.itemId});
                res.render('order/review_detail', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /*订单评价完成、确认收货结果页*/
    orderResult:function(req, res, next){
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        console.log('params',params);
        var data = {}
        params.templateId && (data.templateId = params.templateId);
        HttpClient.request(arguments, {
            url: API.goodsGuessYouLike,
            data: data,
            success: function (data) {
                var json = {
                    rows: data.data,
                    orderNo:params.orderNo
                };
                params.mbeans && (json.mbeans = params.mbeans);
                res.render('order/result', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    }

};

module.exports = order;