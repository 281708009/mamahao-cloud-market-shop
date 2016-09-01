/*
 * 购物车
 * */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');
var Thenjs = require('thenjs');
var request = require('request');
var bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask');
var cart = {
    index: function (req, res, next) {
        res.render("cart/index");
    },
    /* 购物车商品列表 */
    list: function (req, res, next) {
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.cart,
            data: data,
            success: function (data) {
                res.render('cart/components/home', data, function (err, html) {
                    res.json({template: html});
                });
            },
            error: function () {

                res.render('cart/components/home', {}, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /* 选择/取消选择商品 */
    cartOption: function (req, res, next) {
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API[req.params.option],
            data: data,
            success: function (data) {
                res.render('cart/components/home', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /* 结算 */
    settlement: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var args = arguments;

        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.getDefaultDeliveryAddr,
                success: function (data) {
                    cont(null, data);
                }
            });
        }).then(function (cont, arg) {

            var data = {inlet: params.inlet || 1, stockTip: 1};
            if (arg && arg.deliveryAddrId) {
                data.deliveryAddrId = arg.deliveryAddrId;
            }
            if (arg && arg.areaId) {
                data.areaId = arg.areaId;
            }
            if(data.inlet == 2 || data.inlet == 4){
                data.jsonTerm = JSON.stringify(params.jsonTerm);
            }

            HttpClient.request(args, {
                url: API.settlement,
                data: data,
                success: function (data) {
                    var json = data;
                    if (arg && arg.deliveryAddrId) {
                        json = $.extend(data, {deliveryAddr: arg});
                    }

                    var task = bigPipeTask.settlement;
                    task.common.data = {orderNo : json.orderNo};
                    new bigPipe(task, args);
                    bigPipe.prototype.succeed = function () {
                        var me = this;
                        res.render('cart/settlement', json, function (err, html) {
                            console.log(err)
                            var template = html + me.scripts.join('');
                            res.json({template: template});
                        });
                    };

                }
            });

        }, function (cont, err) {
            console.log(err)
        })
    },
    coupon: function (req, res, next) {

    },
    /* 支付 */
    pay: function (req, res, next) {
        var args = arguments;
        var params = req.query; // 请求参数值;
        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.checkPay,
                data: {orderNo: params.orderNo},
                success: function (data) {
                    cont();
                }
            });
        }).then(function () {
            HttpClient.request(args, {
                url: API.pay,
                data: {orderBatchNo: params.orderNo, openid: params.openid},
                success: function (data) {
                    data.openid = params.openid;
                    res.render('cart/pay', data);
                }
            });
        }, function (cont, err) {
            console.log(err)
        })
    },
    payResult: function(req, res, next){
        var args = arguments;
        var params = req.query; // 请求参数值;
        console.log(params);

        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.orderLock,
                data: {orderBatchNo: params.batchNo,orderPayType:params.orderPayType},
                success: function (data) {
                    cont();
                }
            });
        }).then(function () {
            HttpClient.request(args, {
                url: API.getExtraScore,
                data: {orderBatchNo: params.batchNo},
                success: function (data) {
                    var json = data;
                    json.orderBatchNo = params.batchNo;
                    res.render('cart/result', json);
                }
            });

        }, function (cont, err) {
            console.log(err);
        })

    },
    submitInvoice: function (req, res, next) {
        var args = arguments;
        var params = req.body.data; // 请求参数值;
        HttpClient.request(args, {
            url: API.submitInvoice,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    /* 确认订单 */
    check: function (req, res, next) {
        var args = arguments;
        var params = req.body.data; // 请求参数值;
        HttpClient.request(args, {
            url: API.check,
            data: params,
            success: function (data) {
                //data.openid = params.openid;
                res.json(data);
            }
        });
        /*Thenjs(function (cont) {
         HttpClient.request(args, {
         url: API.checkPay,
         data: {orderNo: params.orderNo},
         success: function (data) {
         cont();
         }
         });
         }).then(function () {
         HttpClient.request(args, {
         url: API.check,
         data: params,
         success: function (data) {
         //data.openid = params.openid;
         console.log('支付响应结果----------',data);
         res.render('cart/pay', data);
         }
         });
         }, function (cont, err) {
         console.log(err)
         })*/
    },
    aliPay: function (req, res, next) {
        var params = req.body;
        console.info(params);
        HttpClient.request(arguments, {
            url: API.aliPay,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });

    },
    payTips: function (req, res, next) {
        res.render('payTips');
    },
    //准备微信支付，获取openID
    wxPrePay: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.wxPay,
            type: 'get',
            data: {batchNo: params.orderNo, openId: params.openId},
            success: function (data) {
                res.json({openID: data});
            }
        });

    },
    //获取微信prePayId
    wxPay: function (req, res, next) {
        var params = req.body;
        HttpClient.request(arguments, {
            url: API.wxPay,
            type: 'get',
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    }
};

module.exports = cart;
