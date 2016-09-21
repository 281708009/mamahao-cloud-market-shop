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
            error: function (data) {

                res.render('cart/components/home', data, function (err, html) {
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
            if (params.deliveryAddr) {
                cont(null, params.deliveryAddr)
            } else {
                HttpClient.request(args, {
                    url: API.getDefaultDeliveryAddr,
                    success: function (data) {
                        cont(null, data);
                    }
                });
            }
        }).then(function (cont, arg) {

            var data = {inlet: params.inlet || 1, stockTip: 1};
            if (arg && arg.deliveryAddrId) {
                data.deliveryAddrId = arg.deliveryAddrId;
            }
            if (arg && arg.areaId) {
                data.areaId = arg.areaId;
            }
            if (data.inlet == 2 || data.inlet == 4) {
                data.jsonTerm = JSON.stringify(params.jsonTerm);
            }

            HttpClient.request(args, {
                url: API.settlement,
                data: data,
                success: function (resJson) {
                    var json = resJson;
                    if (arg && arg.deliveryAddrId) {
                        json = $.extend(resJson, {deliveryAddr: arg, inlet: data.inlet});
                    }

                    var task = bigPipeTask.settlement;
                    task.common.data = {orderNo: json.orderNo};
                    new bigPipe(task, args);
                    bigPipe.prototype.succeed = function () {
                        var me = this;
                        //json.limit.gbMaxLimit = json.payPrice * 100;
                        //json.limit.mcMaxLimit = json.payPrice * 3;
                        //json.useCouponlimit.gbMaxLimit = json.useCouponlimit.maxReducePrice * 100;
                        //json.useCouponlimit.mcMaxLimit = json.useCouponlimit.maxReducePrice * 3;

                        res.render('cart/settlement', json, function (err, html) {
                            console.log(err)
                            var template = html + me.scripts.join('');
                            res.json({template: template});
                        });
                    };

                },
                error: function (data) {
                    res.render('cart/components/home', data, function (err, html) {
                        res.json({template: html});
                    });
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
                },
                error: function (error) {
                    res.render('cart/pay', error);
                }
            });
        }).then(function () {
            var crypto = require('../utils/crypto');
            console.log("pay-cookies-openId----->", req.cookies['openId'])
            params.openId = crypto.decipher(req.cookies['openId']);
            HttpClient.request(args, {
                url: API.pay,
                data: {orderBatchNo: params.orderNo, openid: params.openId},
                success: function (data) {
                    data.openid = params.openId;
                    res.render('cart/pay', data);
                }
            });
        }, function (cont, err) {
            console.log("pay----->", err)
        })
    },
    payResult: function (req, res, next) {
        var args = arguments;
        var params = req.query; // 请求参数值;
        console.log(params);

        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.orderLock,
                data: {orderBatchNo: params.batchNo, orderPayType: params.orderPayType},
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
            console.log("payResult----->", err)
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
    // 支付宝支付通用方法;
    aliPay: function (req, res, next) {
        var params = req.body;
        console.info("aliPay---->", params);
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
    //获取微信prePayId，微信支付通用方法;
    wxPay: function (req, res, next) {
        var params = req.body;
        console.info("wxPay---->", params);
        HttpClient.request(arguments, {
            url: API.wxPay,
            type: 'get',
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 校验是否可以支付
    checkPay: function (req, res, next) {
        var params = req.body;
        console.log("checkPay---->", JSON.stringify(params));
        HttpClient.request(arguments, {
            url: API.checkPay,
            data: params,
            success: function (data) {
                res.json(data);
            },
            error: function (error) {
                res.json(error);
            }
        });
    },
    // 微信二维码识别支付状态获取
    queryOrderState: function (req, res, next) {
        var params = req.body;
        console.log("queryOrderState---->", JSON.stringify(params));
        HttpClient.request(arguments, {
            url: API.queryOrderState,
            data: params,
            success: function (data) {
                res.json(data);
            },
            error: function (error) {
                res.json(error);
            }
        });
    }
};

module.exports = cart;
