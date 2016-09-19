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
        log.info("-------------->store.index");
        res.render('goods/index');
    },
    goodsType: function (req, res, next) {
        /*bigPipe方案加载第一页数据*/
        var task = bigPipeTask.goods;
        bigPipe.prototype.succeed = function () {
            var me = this;
            res.render('goods/components/home', {}, function (err, html) {
                err && log.error(err);
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
                    err && log.error(err);
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
     * 备注:先显示部分内容，然后在请求页面需要的其他接口
     * */
    detail: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var location = require("querystring").parse(req.get('location')) || {};  //header中的定位信息
        var args = {
            inlet: params.inlet,
            jsonTerm: JSON.stringify({
                areaId: params.location ? params.location.areaId : location.areaId,
                lat: params.location ? params.location.lat : location.lat,
                lng: params.location ? params.location.lng : location.lng,
                templateId: params.templateId,
                itemId: params.itemId,
                shopId: params.shopId
            })
        };
        //console.log(params)
        HttpClient.request(arguments, {
            url: API.goodsDetail,
            data: args,
            success: function (data) {
                data.paramsLocation = params.location || location;
                //console.log('xxxxxxxxxxx===',data.paramsLocation)
                res.render("goods/detail", data, function (err, html) {
                    err && log.error(err);
                    res.json({template: html});
                });
            }
        });
    },
    //详情页继续请求其他接口
    detailExtra: function (req, res, next) {
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;

        var task = bigPipeTask.goodsDetail;
        task.common.data = {
            inlet: data.inlet,
            templateId: data.templateId
        };

        //更新地理位置信息
        if (data.location) {
            task.common.data.areaId = data.location.areaId;
            task.common.data.lat = data.location.lat;
            task.common.data.lng = data.location.lng;
        }

        //sku需要的参数
        task.module[3].data = {
            reservedNo: 0
        };

        //促销政策需要的参数
        task.module[5].data = {
            styleNumId: data.templateId
        };

        bigPipe.prototype.succeed = function () {
            var me = this;
            var template = me.scripts.join('');
            res.json({template: template});
        };
        new bigPipe(task, arguments);
    },
    //商品组合促销套餐列表
    promoteGroup: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.goodsPromoteGroup,
            data: params,
            success: function (data) {
                res.render("goods/components/promote_group", {rows: data}, function (err, html) {
                    err && log.error(err);
                    res.json({template: html});
                });
            }
        });
    },
    //查询sku
    sku: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.querySku,
            data: params,
            success: function (data) {
                res.render("lists/goods_sku", data, function (err, html) {
                    res.json({template: html});
                });
            }
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
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        res.render("goods/components/qualityPic", {rows: params}, function (err, html) {
            res.json({template: html});
        });
    },
    /*搜索入口*/
    search: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        if (params.keywords) params.keywords = decodeURIComponent(params.keywords);
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
