/*
* 购物车
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');
var config_wechat = AppConfig.site.wechat;
var Thenjs = require('thenjs');
var request = require('request');
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
        var args = arguments;
        var params = req.params; // 请求参数值;
        Thenjs(function(cont){
            HttpClient.request(args, {
                url: API.getDefaultDeliveryAddr,
                success: function (data) {
                    cont(null, data);
                }
            });
        }).then(function (info) {
            console.log(info);
            HttpClient.request(args, {
                url: API.settlement,
                data: {inlet: 1},
                success: function (data) {
                    res.render('cart/settlement', data);
                }
            });
        }, function (cont, err) {
            console.log(err)
        })
    },
    /* 支付 */
    pay:function (req, res, next) {
        var args = arguments;
        var params = req.query; // 请求参数值;
        Thenjs(function(cont){
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
                data: {orderBatchNo: params.orderNo,openid:params.openid},
                success: function (data) {
                    data.openid = params.openid;
                    res.render('cart/pay', data);
                }
            });
        }, function (cont, err) {
            console.log(err)
        })
    },
    aliPay:function (req, res, next) {
        var params = req.body;
        HttpClient.request(arguments, {
            url: API.aliPay,
            data: {batchNo: params.batchNo},
            success: function (data) {
                res.json(data);
            }
        });

    },
    payTips:function (req, res, next) {
        res.render('payTips');
    },
    //准备微信支付，获取openID
    wxPrePay:function (req, res, next) {
        HttpClient.request(arguments, {
             url: API.wxPay,
             type:'get',
            data:{batchNo:params.orderNo,openId:params.openId},
             success: function (data) {
                res.json({openID: data});
             }
         });

    },
    //获取微信prePayId
    wxPay:function (req,res,next) {
        var params = req.body;
        HttpClient.request(arguments, {
            url: API.wxPay,
            type:'get',
            data:params,
            success: function (data) {
                res.json(data);
            }
        });
    }
};

module.exports = cart;
