/*
* 购物车
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');

var Thenjs = require('thenjs');
var cart = {
    index: function (req, res, next) {
        res.render("cart/index");
    },
    list: function (req, res, next) {
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.cart,
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
        res.render("cart/settlement");
    },
    /* 支付 */
    pay:function (req, res, next) {
        var args = arguments;
        var params = req.params; // 请求参数值;
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
                data: {orderBatchNo: params.orderNo},
                success: function (data) {
                    res.render('cart/pay', data);
                }
            });
        }, function (cont, err) {
            console.log(err)
        })
    }
};

module.exports = cart;
