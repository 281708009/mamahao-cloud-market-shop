/*
 * 商品相关
 * */
var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api'),
    crypto = require('../utils/crypto');

var Thenjs = require('thenjs');

var store = {
    /*商品分类*/
    index: function (req, res, next) {
        res.render('goods/index');
    },
    goodsType: function (req, res, next) {
        /*bigPipe方案加载第一页数据*/
        var task = bigPipeTask.goods;
        new bigPipe(task, arguments, {
            succeed: function () {
                var me = this;
                res.render('goods/components/home', {}, function (err, html) {
                    err && log.error(err);
                    var template = html + me.scripts.join('');
                    res.json({template: template});
                });
            }
        });
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
        var args = arguments;
        var query = req.query; // 请求参数值;
        var mmh_location = req.cookies && req.cookies['mmh_app_location'];

        var jsonTerm = {
            templateId: query.templateId,
            itemId: query.itemId
        };
        if (mmh_location) {
            mmh_location = JSON.parse(new Buffer(mmh_location, "base64").toString());
            jsonTerm.areaId = mmh_location.areaId;
            jsonTerm.lat = mmh_location.lat;
            jsonTerm.lng = mmh_location.lng;
        }
        if (query.shopId) {
            jsonTerm.shopId = query.shopId;
        }
        var params = {
            inlet: query.inlet,
            templateId: query.templateId,
            jsonTerm: JSON.stringify(jsonTerm)
        };
        // deviceId 设备ID，徽信端用openid代替;
        var openId = req.session.wechat_auth && req.session.wechat_auth.openid;
        if(openId){
            params.deviceId = openId;
        }
        //console.log(query)

        Thenjs(function (cont) {
            HttpClient.request(args, {
                url: API.goodsDetail,
                data: params,
                success: function (data) {
                    data.paramsLocation = mmh_location;
                    data.request = query;
                    res.render('goods/detail', data, function (err, html) {
                        err && log.error(err);
                        res.write(html);
                        cont(null, data);
                    });
                }
            });
        }).then(function (cont, basicInfo) {
            if (jsonTerm.areaId) {
                params.areaId = jsonTerm.areaId;
            }
            HttpClient.request(args, {
                url: API.goodsDetailExtra,
                data: params,
                success: function (data) {
                    /*{
                     "goodsCouponList"：{}, //优惠券列表
                     "guessYouLike":{}, //猜你喜欢
                     "promotionList":{}, //促销列表
                     "goodsParams":{}, //商品参数
                     "goodsCommentList":{}//2条口碑记录
                     "monspPmtList":{}//每月购
                     }*/

                    //商品可获麻豆数量
                    //data.basicInfo = {};
                    //if(basicInfo) data.basicInfo = basicInfo;

                    data.basicInfo = basicInfo;

                    var path = require('path');
                    var viewPath = path.join(__dirname, '../views');

                    var modulesInfo = [
                        //商品参数
                        {
                            selector: "#swipe-detail .config",
                            data: data.goodsParams,
                            pug: '/lists/goods_params.pug'
                        },
                        //优惠券列表
                        {
                            selector: ".sale .coupon",
                            data: data.goodsCouponList,
                            pug: '/goods/components/coupon_list.pug'
                        },
                        //促销列表
                        {
                            selector: ".sale .promote",
                            data: data.promotionList,
                            pug: '/goods/components/promote_list.pug'
                        },
                        //每月购礼包列表
                        {
                            selector: ".sale .monthly",
                            data: data.monspPmtList,
                            pug: '/goods/components/monthly_list.pug'
                        },
                        {
                            selector: ".m-monthly-pop .content",
                            data: data.monspPmtList,
                            pug: '/goods/components/monthly_modal.pug'
                        }
                    ];
                    res.write('<script>function bigPipeRender(selector, context){if(document.querySelector(selector)){document.querySelector(selector).innerHTML=context;}}</script>');
                    modulesInfo.forEach(function (v, i) {
                        if(v.data){
                            var context = pug.renderFile(viewPath + v.pug, data).replace(/'/g, "\\'").replace(/\n/g, "\\n");     //内容
                            res.write("<script>bigPipeRender('" + v.selector + "','" + context + "');</script>");
                        }
                    });
                    res.end();
                }
            });
        }, function (cont, err) {
            err && log.error(err);
        });


    },
    //详情页继续请求其他接口
    detailExtra: function (req, res, next) {
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;

        var task = $.extend({}, bigPipeTask.goodsDetail);  //避免引用关系

        task.common.data = {
            inlet: data.inlet,
            templateId: data.templateId
        };

        //sku需要的参数
        task.module[1].data = {
            reservedNo: 0
        };

        new bigPipe(task, arguments, {
            succeed: function () {
                var me = this;
                var template = me.scripts.join('');
                res.json({template: template});
            }
        });
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
    // 独立的商品组合促销页面;
    group: function (req, res, next) {
        //var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var params = req.query;
        HttpClient.request(arguments, {
            url: API.goodsPromoteGroup,
            data: params,
            success: function (data) {
                res.render("goods/group", {rows: data});
            }
        });
    },
    // 赠品列表页面;
    gifts: function (req, res, next) {
        var params = req.query;
        HttpClient.request(arguments, {
            url: API.giftsList,
            data: params,
            success: function (data) {
                res.render("goods/components/gift_list", data);
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
                    err && log.error(err);
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
    },
    // 质检报告;
    qualityReport: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.goodsQuery,
            data: req.query,
            success: function (data) {
                res.render("goods/query", {pic: data});
            }
        });
    },
    // 凑单商品列表页
    supplement: function (req, res, next) {
        var args = arguments;
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, req.query);
        HttpClient.request(args, {
            url: API.getSupplementGoods,
            data: req.query,
            success: function (data) {
                data.params = params;
                res.render("goods/supplement", data, function (err, html) {
                    res.write(html);

                    var task = bigPipeTask.supplement;
                    task.module = data.tab.map(function (v, i) {
                        if (i !== data.selectedIndex) {
                            return {
                                selector: ".u-goods-one.list-" + i,
                                data: {
                                    minPrice: v.minPrice,
                                    maxPrice: v.maxPrice
                                }
                            }
                        }
                    });
                    new bigPipe(task, args, {chunked: true});
                });
            }
        });
    },

    // 凑单列表API
    getSupplementList:function (req, res, next) {
        var args = arguments;
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, req.query);
        HttpClient.request(args, {
            url: API.getSupplementGoods,
            data: params,
            success: function (data) {
                data.request = params;
                res.render("lists/supplement", data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },

    // 猜你喜欢商品列表 goodsGuessYouLike
    guessYouLike:function (req, res, next) {
        var args = arguments;
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        $.extend(params, req.query);
        HttpClient.request(args, {
            url: API.goodsGuessYouLike,
            data: params,
            success: function (data) {
                data.request = params;
                res.render("lists/goods_hot_sale", data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    }
};

module.exports = store;
