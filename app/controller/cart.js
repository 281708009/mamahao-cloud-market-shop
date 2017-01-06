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
        var task = bigPipeTask.cart;
        var isWeChat = /micromessenger/gi.test(req.header("user-agent"));
        if (isWeChat) {
            var wechat_user = req.session.wechat_user || {};
            data.deviceId = wechat_user.openid
        }
        // 判断跳转来源是否为每月购
        if(data.vip && data.vip == 1){
            HttpClient.request(arguments, {
                url: API.cart,
                data: data,
                success: function (resJson) {
                    $.extend(resJson,data);
                    res.render('cart/components/goods_list', resJson, function (err, html) {
                        err && log.error(err);
                        res.json({template: html});
                    });
                },
                error:function(errorInfo){
                    $.extend(errorInfo,data);
                    res.render('cart/components/goods_list', errorInfo, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        }else{
            task.common.data = data;
            new bigPipe(task, arguments, {
                succeed: function () {
                    var me = this;
                    res.render('cart/components/home', {}, function (err, html) {
                        err && log.error(err);
                        var template = html + me.scripts.join('');
                        res.json({template: template});
                    });
                }
            });
        }

    },
    /* 选择/取消选择商品 修改商品数量 */
    cartOption: function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API[req.params.option],
            data: reqData,
            success: function (data) {
                $.extend(data, reqData);
                res.render('cart/components/goods_list', data, function (err, html) {
                    res.json({template: html});
                });
            },
            error:function(errorInfo){
                $.extend(errorInfo, reqData);
                res.render('cart/components/goods_list', errorInfo, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /* 切换sku */
    changeSKU: function (req, res, next) {
        var reqData = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.changeSKU,
            data: reqData,
            success: function (data) {
                $.extend(data, reqData);
                res.render('cart/components/goods_list', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /* 分页获取推荐商品列表 */
    getRecommendList: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.getRecommendList,
            data: params,
            success: function (data) {
                data.request = params;
                res.render('cart/components/recommend', data, function (err, html) {
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
            var data = {inlet: params.inlet || 1, stockTip: 1, channel: 1}; // 微商城专用区分订单所用 channel=1  （paysType=5废弃）
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
                    json.inlet = data.inlet;
                    if (arg && arg.deliveryAddrId) {
                        json = $.extend(resJson, {deliveryAddr: arg});
                    }

                    var task = bigPipeTask.settlement;
                    task.common.data = {orderNo: json.orderNo};
                    new bigPipe(task, args, {
                        succeed: function () {
                            var me = this;
                            res.render('cart/settlement', json, function (err, html) {
                                console.log(err)
                                var template = html + me.scripts.join('');
                                res.json({template: template});
                            });
                        }
                    });

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
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.coupons,
            data: params,
            success: function (data) {
                $.extend(data, params);
                res.render('cart/coupon', data, function(err, html){
                    res.json({template: html});
                });
            }
        });
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
            params.openId = req.session.wechat_auth.openid;
            HttpClient.request(args, {
                url: API.pay,
                data: {orderBatchNo: params.orderNo, openid: params.openId},
                success: function (data) {
                    data.openid = params.openId;
                    data.dealingType = params.dealingType;
                    res.render('cart/pay', data);
                }
            });
        }, function (cont, err) {
        })
    },
    /**
     * 支付成功结果页
     * @param req
     * @param res
     * @param next
     * 1.锁单
     * 2.请求获取可获得妈豆、积分信息； 请求获取评价商品列表/请求获取推荐商品列表
     */
    payResult: function (req, res, next) {
        var data = {};
        var params = req.query; // 请求参数值;
        $.extend(data, params);
        var args = arguments;


        HttpClient.request(args, {
            url: API.getExtraScore,
            data: {orderBatchNo: params.batchNo},
            success: function (data) {
                var json = data;
                json.orderBatchNo = params.batchNo;
                json.dealingType = params.dealingType;
                res.render('cart/result', json, function(err, html){
                    var script = '<script>function bigPipeRender(selector, context){if(document.querySelector(selector)){document.querySelector(selector).innerHTML=context;}}</script>';
                    res.write(html);


                    //logic
                    if(json.dealingType == 2){
                        HttpClient.request(args, {
                            url: API.queryWaitToCommentItems,
                            data: {orderNo: params.batchNo},
                            success: function (data) {
                                if(!data.rows.length){
                                    requestRecommendList(args);
                                }else{
                                    res.render('lists/tobe_comment.pug', data, function (err, html) {
                                        err && log.error(err);
                                        res.write(script);
                                        var context = "<script>bigPipeRender('#reviewList', '"+ html +"')</script>";
                                        res.write(context);
                                        res.end();
                                    });
                                }
                            }
                        });
                    }else{
                        requestRecommendList(args);
                    }


                    function requestRecommendList(args, params){
                        var res = args[1];
                        HttpClient.request(args, {
                            url: API.goodsGuessYouLike,
                            data: params,
                            success: function (data) {
                                res.render('cart/guess_you_like.pug', data || [], function (err, html) {
                                    err && log.error(err);
                                    res.write(script);
                                    var context = "<script>bigPipeRender('.push', '"+ html +"')</script>";
                                    res.write(context);
                                    res.end();
                                });
                            }
                        });
                    }


                });
            }
        });

        //HttpClient.request(args, {
        //    url: API.orderLock,
        //    data: {orderBatchNo: params.batchNo, orderPayType: params.orderPayType},
        //    success: function (data) {
        //        $.extend(data, params);
        //        res.render('cart/result',data);
        //    }
        //});
        //Thenjs(function (cont) {
        //    HttpClient.request(arguments, {
        //        url: API.orderLock,
        //        data: {orderBatchNo: params.batchNo, orderPayType: params.orderPayType},
        //        success: function (data) {
        //            cont();
        //        }
        //    });
        //}).then(function(cont, args){
        //    HttpClient.request(arguments, {
        //        url: API.getExtraScore,
        //        data: {orderBatchNo: params.batchNo},
        //        success: function (data) {
        //            var json = data;
        //            json.orderBatchNo = params.batchNo;
        //            json.dealingType = params.dealingType;
        //            res.render('cart/result', json);
        //        }
        //    });
        //}, function (cont, err) {
        //    console.log("payResult----->", err)
        //});

    },
    /* 提交发票信息 */
    submitInvoice: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.submitInvoice,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    /* 确认订单 */
    check: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params,req.query);
        HttpClient.request(arguments, {
            url: API.check,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },

    /* 验货付款订单去支付 */
    checkByInspect:function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.inspectConfirm,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });

    },
    // 支付宝支付通用方法;
    aliPay: function (req, res, next) {
        var params = req.body;
        console.info("aliPay-params---->", JSON.stringify(params));
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
        console.info("wxPay---->", JSON.stringify(params));
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