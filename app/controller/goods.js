/*
 * 商品相关
 * */
var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api');

var Thenjs = require('thenjs');

var store = {
    /*商品分类*/
    index: function (req, res, next) {

        /*bigPipe方案加载第一页数据*/
        res.render('goods/index', {}, function (err, html) {
            res.write(html);
        });

        var task = bigPipeTask.goods;
        new bigPipe(task, arguments, true);
        bigPipe.prototype.succeed = function () {
            res.end();
        };
    },
    /*获取商品二级列表*/
    getGoodsTypeTree: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.goodsTypeTree,
            data: params,
            success: function (data) {
                res.render('lists/goods_type_detail', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /*商品列表*/
    list: function (req, res, next) {
        var defaults = {
            searchType: 0,     //	0综合，1销量，2价格，3最新
            sort: 0,
            nextPageStart: 0,
            pageSize: 20
        };
        var params = $.extend({}, defaults, req.query || {});
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        //来源为ajax翻页请求
        if (data.ajax) {
            params = $.extend({}, params, data);
            HttpClient.request(arguments, {
                url: API.goodsList,
                data: params,
                success: function (data) {
                    res.render("list/goods", data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        } else {
            HttpClient.request(arguments, {
                url: API.goodsList,
                data: params,
                success: function (data) {
                    res.render("goods/list", data);
                }
            });
        }
    },
    /*品牌宣导*/
    brand: function (req, res, next) {
        res.render("goods/brand");
    },
    /*商品详情
     * 备注:建议使用bigPipe方案
     * */
    detail: function (req, res, next) {
        var args = arguments;
        var data = req.query;
        var params = {
            inlet: data.inlet,
            jsonTerm: JSON.stringify({templateId: data.templateId, itemId: data.itemId})
        };
        //异步流程控制
        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.goodsDetail,
                data: params,
                success: function (data) {
                    res.render("goods/detail", data, function (err, html) {
                        res.write(html);
                        cont();
                    });
                }
            });
        }).then(function () {
            var task = bigPipeTask.goodsDetail;
            task.common.data = {
                templateId: data.templateId
            };

            new bigPipe(task, args, true);
            bigPipe.prototype.succeed = function () {
                res.end();
            };

        }, function (cont, err) {
            console.log(err);
        });
    },
    /*质检报告*/
    qualityPic: function (req, res, next) {
        var data = {
            templateId: req.query.templateId
        };
        res.render("goods/qualityPic", data);
    },
    /*搜索入口*/
    search: function (req, res, next) {
        var json = {keywords: req.query.keywords || ''};
        HttpClient.request(arguments, {
            url: API.searchHotWords,
            success: function (data) {
                json.hotWords = data;
                res.render("search/index", json);
            }
        });
    },
    /*搜索结果*/
    search_result: function (req, res, next) {
        var params = req.query;
        var keywords = params.keywords || '';
        HttpClient.request(arguments, {
            url: API.search,
            data: {
                //ages: "0-3,3-6",
                areaId: 330102,
                //brandIds: "63,75",
                //categoryId: 34,
                keyword: keywords,
                lat: 30.22965,
                lng: 120.192567,
                nextPageStart: 0,
                pageSize: 20,
                searchType: 0,     //	0综合，1销量，2价格，3最新
                sort: 0
            },
            success: function (data) {
                data.keywords = keywords;
                res.render("search/result", data);
            }
        });
    },
    /*筛选*/
    filter: function (req, res, next) {
        var params = req.query;
        HttpClient.request(arguments, {
            url: API.filterCategory,
            success: function (data) {
                data.params = params;
                res.render("search/filter", data);
            }
        });
    }
};

module.exports = store;
