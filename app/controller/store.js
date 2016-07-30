/*
* 门店
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');

var store = {
    // 门店列表
    index: function (req, res, next) {
        res.render('store/index');
    },
    //门店列表
    storeList: function (req, res, next) {
        var defaults = {
            count: 10,
            page: 1
        };
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var params = $.extend({}, defaults, data);

        //来源为ajax翻页请求
        if (data.ajax) {
            params = $.extend({}, params, data);
            HttpClient.request(arguments, {
                url: API.queryMemberShopIndex,
                data: params,
                success: function (data) {
                    res.render("list/store", data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        } else {
            HttpClient.request(arguments, {
                url: API.queryMemberShopIndex,
                data: params,
                success: function (data) {
                    data.request = params;
                    res.render('store/components/home', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        }

    }
};

module.exports = store;