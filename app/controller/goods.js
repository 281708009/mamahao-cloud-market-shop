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
        res.render('goods/index');
    },
    goodsType: function (req, res, next) {
        /*bigPipe方案加载第一页数据*/
        var task = bigPipeTask.goods;
        bigPipe.prototype.succeed = function () {
            var me = this;
            res.render('goods/components/home', {}, function (err, html) {
                console.log(html)
                var template = html + me.scripts.join('');
                res.json({template: template});
            });
        };
        new bigPipe(task, arguments);
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
            nextPageStart: 0,
            pageSize: 20,
            searchType: 0,     //	0综合，1销量，2价格，3最新
            sort: 0
        };
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var params = $.extend({}, defaults, data);

        var pug = 'goods/components/list', apiURL = API.goodsList;
        //搜索来源
        if (data.keywords) {
            params.keyword = data.keywords || '';
            apiURL = API.search;
        }

        //来源为ajax翻页请求
        if (data.ajax) {
            pug = 'lists/goods';
        }

        HttpClient.request(arguments, {
            url: apiURL,
            data: params,
            success: function (data) {
                data.params = params;
                res.render(pug, data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
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
            jsonTerm: JSON.stringify(data)
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
                inlet: params.inlet,
                templateId: data.templateId
            };

            //sku需要的参数
            task.module[3].data = {
                reservedNo: 0
            };

            new bigPipe(task, args, true);
            bigPipe.prototype.succeed = function () {
                res.end();
            };

        }, function (cont, err) {
            console.log(err);
        });
    },
    //添加到购物车
    addToCart: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.addToCart,
            data: params,
            success: function (data) {
                res.json(data);
            }
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
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.searchHotWords,
            success: function (data) {
                var json = {
                    hotWords: data,
                    params: params
                };
                res.render("search/index", json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    //搜素下拉提示
    searchKeywordTips: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.searchKeywordTips,
            data: params,
            success: function (data) {
                res.render("lists/search_tips", {rows: data.data}, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /*筛选*/
    filter: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.filterCategory,
            success: function (data) {
                data.params = params;
                res.render("search/filter", data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    }
};

module.exports = store;
