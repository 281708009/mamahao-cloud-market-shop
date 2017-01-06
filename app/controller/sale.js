/**
 * 会员购控制器
 */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');
var request = require('request');
var bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask');

var sale = {
    // 每月购首页
    index: function (req, res, next) {
        var copySession = {};
        copySession = $.extend({}, req.session);
        var originalUrl = req.protocol + '://' + req.get('host') + req.url;
        //log.info("sale-------->", JSON.stringify(session));
        if(copySession.user && copySession.user.memberId){
            var defaults = {
                isLogin: true,      // 登录状态
                isCover: true,      // 封面状态
                fixed: 1,           // 当前显示哪一个区块
                user: copySession.user, // 妈妈好用户信息
                weChatUser: copySession.wechat_user // 微信用户信息
            };
            // 已经登录;
            if(defaults.user.breedStatus == 0){
                // 用户未选择身份
                var href = ["/center/identity/?origin=", encodeURIComponent(originalUrl)].join("");
                res.redirect(href);
            }else{
                switch(Number(defaults.user.breedStatus)){
                    case 1:
                        defaults.breedName = "怀孕中";
                        break;
                    case 3:
                        defaults.breedName = "备孕中";
                        break;
                }
                var userLocation = req.cookies && req.cookies['mmh_sale_areaId'], params = {};
                // 用户手动调整的定位 区域ID
                if(userLocation){
                    userLocation = JSON.parse(userLocation) || {};
                    userLocation.areaID && (params.manualAreaId = userLocation.areaID);
                    defaults.userLocation = userLocation;
                }
                HttpClient.request(arguments, {
                    url: API.queryMonspMainPage,
                    data: params,
                    success: function (data) {
                        var mmh_sale_status = req.cookies && req.cookies['mmh_sale_status'],
                            query = req.query,
                            month = data.coverInfo && data.coverInfo.month; // 当前封面月份
                        if(mmh_sale_status){
                            mmh_sale_status = JSON.parse(mmh_sale_status);
                            // 校验当前月份封面状态
                            if(mmh_sale_status.cover != month){
                                $.extend(defaults, {
                                    isCover: true,              // 要显示当前月封面;
                                    fixed: query.fixed || 1     // 当前显示页数，如果url传了指定页数，以url优先;
                                });
                                $.extend(mmh_sale_status, {
                                    cover: month,               // 要显示当前月封面;
                                    fixed: 2                    // 记录下一次要显示的页数;
                                });
                            }else{
                                $.extend(defaults, {
                                    isCover: false,              // 要显示当前月封面;
                                    // 当前显示页数，url > cookie > 1;
                                    fixed: query.fixed || mmh_sale_status.fixed || 1
                                });
                            }
                        }else{
                            mmh_sale_status = {
                                fixed: 2, // 显示清单列表
                                cover: month // 当前月是否显示过封面
                            };
                        }
                        // 写入相关状态cookie
                        res.cookie('mmh_sale_status', JSON.stringify(mmh_sale_status), {path: '/', maxAge: 86400000 * 365});
                        // 异常处理;
                        if(!data.coverInfo) defaults.isCover = false; // 如果没有封面数据，那么不显示封面，直接进入清单页面;
                        // 用户已选择身份
                        defaults.data = data;
                        //console.log("defaults---------------------------->", JSON.stringify(defaults));
                        res.render('sale/index', defaults);
                    }
                });

            }
        }else{
            // 未登录;
            HttpClient.request(arguments, {
                url: API.queryMonspMainPage,
                success: function (data) {
                    if(data.coverInfo){
                        res.render('sale/index', {data: {coverInfo: data.coverInfo}, fixed: -1});
                    }else{
                        var href = ["/account/bind/?origin=", encodeURIComponent(originalUrl)].join("");
                        res.redirect(href);
                    }
                }
            });
        }
    },
    // 清单分页
    groupPage: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryMonspGroupNextPage,
            data: params,
            success: function (data) {
                res.render("sale/components/list.pug", {rows: data}, function (err, html) {
                    console.log(err);
                    res.json({template: html, data: data});
                });
            }
        });
    },
    // 商品合计;
    total: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.bottomBanner,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 屏蔽商品
    shield: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.addUnnecessaryGoods,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 导购页
    guide: function (req, res, next) {
        var query = req.query; // 请求参数值;
        var args = arguments;
        var params = {
            id: query.guideId,
            styleNumId: query.styleNumId
        };
        log.info("访问导购页的url------->", req.url);
        HttpClient.request(args, {
            url: API.monspGuideBody,
            data: params,
            success: function (data) {
                res.render('sale/guide', data, function (err, html) {
                    res.write(html);

                    // 加载商品信息;
                    var task = $.extend(true, bigPipeTask.guide);  //避免引用关系
                    // 此商品基本信息查询;
                    task.module[0].data = {
                        styleNumIds: params.styleNumId,
                        vipInfoShow: true
                    };
                    // 此商品分组状态查询;
                    task.module[1].data = {
                        styleNumId: params.styleNumId,
                        areaId: query.areaId
                    };
                    // sku
                    task.module[2].data = {
                        inlet: 6,
                        templateId: params.styleNumId,
                        reservedNo: 0
                    };
                    new bigPipe(task, args, {chunked: true});
                });
            }
        });
    },
    // 导购页商品信息
    guideCheck: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.monspGuideCheck,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 导购页详情内商品信息
    guideItems: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryItemPrice,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 同类商品
    similar: function (req, res, next) {
        var query = req.query; // 请求参数值;
        var data = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var defaults = {
            entry: 3,
            firstTime: true,
            pageSize: 20,
            page: 1
        };
        var params = $.extend({}, query, defaults, data);
        // 联调阶段启用数据请求;
        HttpClient.request(arguments, {
            url: API.searchGoodsQuery,
            data: params,
            success: function (data) {
                var rows = {}, i = 0, l = data.data.length;
                for(; i < l; i++){
                    if(data.data[i].type == 4){
                        rows.goods = data.data[i].goods;
                    }
                }
                if(params.ajax){
                    res.render("sale/components/similar_goods.pug", rows, function (err, html) {
                        console.log(err);
                        res.json({template: html});
                    });
                }else{
                    rows.keyword = params.keyword;
                    res.render('sale/similar', rows);
                }
            }
        });
    },
    // 封面预览
    cover: function (req, res, next) {
        var query = req.query, coverInfo = {
            backgroundImg: query.bg || "",
            longImg: query.long || "",
            titleText: query.title || "",
            circleImg: query.circle || "",
            countDownColor: query.color || ""
        };
        res.render('sale/cover', {data: {coverInfo: coverInfo, isLogin: query.login || false}});
    }
};
module.exports = sale;