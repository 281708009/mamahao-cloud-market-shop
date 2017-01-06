/**
 * 结算页 包括流程 选择地址、选择支付方式（在线支付/验货付款）
 */

var HttpClient = require("../utils/http_client");
var request = require('request');
var API = require('../config/api');
var Thenjs = require('thenjs');
var bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask');

var settlement = {
    index: function (req, res, next) {
        res.render('settlement/index');
    },
    /* 结算-选择是否验货付款页 */
    inspect: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, req.query);
        var args = arguments;
        Thenjs(function (cont) {
            if (params.deliveryAddrId) {
                HttpClient.request(args, {
                    url: API.addressList,
                    success: function (data) {
                        var json = {}, list = data.data, len = list.length;
                        for (var i = 0; i < len; i++) {
                            if (list[i].deliveryAddrId == params.deliveryAddrId) {
                                json = list[i];
                                break;
                            }
                        }
                        cont(null, json);
                    }
                });
            } else {
                HttpClient.request(args, {
                    url: API.getDefaultDeliveryAddr,
                    success: function (data) {
                        data.isDefault = 1;
                        cont(null, data);
                    }
                });
            }
        }).then(function (cont, arg) {
            var data = {inlet: params.inlet || 1, stockTip: 1, paysType: 5}; // 微商城专用区分订单所用 paysType=5
            if (arg && arg.deliveryAddrId) {
                data.deliveryAddrId = arg.deliveryAddrId;
            }
            if (arg && arg.areaId) {
                data.areaId = arg.areaId;
            }
            if (data.inlet == 2 || data.inlet == 4) {
                data.jsonTerm = JSON.stringify(params.jsonTerm);
            }
            data.channel = 1; // 0:app, 1:h5
            data.isSupportInspect = params.vip ? 1 : 0;  // 0:普通结算 1:支持验货付款的结算

            HttpClient.request(args, {
                url: API.settlement,
                data: data,
                success: function (resJson) {
                    var json = resJson;
                    json.inlet = data.inlet;
                    json.reqParams = data;
                    if (arg && arg.deliveryAddrId) {
                        json.deliveryAddr = arg;
                    }
                    res.render('settlement/inspect', json, function (err, html) {
                        err && log.error(err);
                        res.json({template: html});
                    });

                },
                error: function (data) {
                    res.render('settlement/inspect', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });

        }, function (cont, err) {
            console.log(err)
        })

    },
    /* 结算页(确认订单) */
    settlement: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var args = arguments;

        Thenjs(function (cont) {
            if (params.deliveryAddrId) {
                HttpClient.request(args, {
                    url: API.addressList,
                    success: function (data) {
                        var json = {}, list = data.data, len = list.length;
                        for (var i = 0; i < len; i++) {
                            if (list[i].deliveryAddrId == params.deliveryAddrId) {
                                json = list[i];
                                break;
                            }
                        }
                        cont(null, json);
                    }
                });
            } else {
                HttpClient.request(args, {
                    url: API.getDefaultDeliveryAddr,
                    success: function (data) {
                        data.isDefault = 1;
                        cont(null, data);
                    }
                });
            }
        }).then(function (cont, arg) {
            var data = {inlet: params.inlet || 1, stockTip: 1, paysType: 5}; // 微商城专用区分订单所用 paysType=5
            if (arg && arg.deliveryAddrId) {
                data.deliveryAddrId = arg.deliveryAddrId;
            }
            if (arg && arg.areaId) {
                data.areaId = arg.areaId;
            }
            if (data.inlet == 2 || data.inlet == 4) {
                data.jsonTerm = JSON.stringify(params.jsonTerm);
            }
            data.channel = 1; // 0:app, 1:h5
            data.isSupportInspect = params.vip == 1 ? 1 : 0;  // 0:普通结算 1:支持验货付款的结算
            HttpClient.request(args, {
                url: API.settlement,
                data: data,
                success: function (resJson) {
                    var json = resJson;
                    json.inlet = data.inlet;
                    if (arg && arg.deliveryAddrId) {
                        json.deliveryAddr = arg;
                    }
                    var task = bigPipeTask.settlement;
                    task.common.data = {orderNo: json.orderNo};
                    new bigPipe(task, args, {
                        succeed: function () {
                            var me = this;
                            res.render('settlement/confirm', json, function (err, html) {
                                err && log.error(err);
                                var template = html + me.scripts.join('');
                                res.json({template: template});
                            });
                        }
                    });

                },
                error: function (data) {
                    res.render('settlement/confirm', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });

        }, function (cont, err) {
            console.log(err)
        })
    },
    /* 修改地址后请求该接口,重新渲染是否支持验货付款  */
    isSupportInspect: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.settlement,
            data: params,
            success: function (data) {
                res.render('settlement/selection', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /* 确认订单 */
    checkout: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.checkoutByInspect,
            data: params,
            success: function (data) {
                res.render('settlement/result', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /* 验货付款订单确认收货获取商品信息 */
    getOrderCart: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.getCartWithInspect,
            data: params,
            success: function (data) {
                $.extend(data, params);
                res.render('order/cart', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },

    /* 选择/取消选择商品 修改商品数量 */
    cartOption: function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API[req.params.option],
            data: reqData,
            success: function (data) {
                $.extend(data, reqData);
                res.render('order/cart', data, function (err, html) {
                    err && console.log(err);
                    res.json({template: html});
                });
            }
        });

    },
    /* 获取待评价商品列表 */
    getTobeCommentList: function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryWaitToCommentItems,
            data: reqData,
            success: function (data) {
                $.extend(data, reqData);
                var data = {};
                res.render('lists/tobe_comment', data, function (err, html) {
                    err && console.log(err);
                    res.json({template: html});
                });
            }
        });

    },

    /* 支付成功页提交商品评价 */
    commentGoodsTemplate: function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.commentGoodsTemplate,
            data: reqData,
            success: function (data) {
                res.render('settlement/result', data, function (err, html) {
                    err && console.log(err);
                    res.json({template: html});
                })
            }
        });

    },

    // 获取结算推荐以外的可用优惠券
    queryStlOrderVouchers:function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryStlOrderVouchers,
            data: reqData,
            success: function (data) {
                res.render('cart/coupon', data, function (err, html) {
                    err && console.log(err);
                    res.json({template: html});
                })
            }
        });
    },

    /* 评价成功结果页 确认订单成功结果页 */
    result: function (req, res, next) {
        var data = req.query;   //orderBatchNo

        // 1. 锁单
        // 2. 获取订单详情 判断是否验货付款订单
        // 3. 验货付款订单

        Thenjs(function (cont) {
            // 先锁单
        }).then(function () {

        });
        res.render('settlement/result', data);
    }
}

module.exports = settlement;