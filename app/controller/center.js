var HttpClient = require("../utils/http_client");
var bigPipe = require("../utils/bigPipe");
var bigPipeTask = require('../config/bigPipeTask');
var API = require('../config/api');

/*到个人主页*/
var center = {
    index: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.center,
            success: function (data) {
                var session_user = req.session.user || {};  // 用户基本信息数据;
                data.avatar = session_user.avatar; //头像
                data.nickName = session_user.nickname; // 用户名

                res.render('users/index', data);
            }
        });
    },
    /*订单列表*/
    orders: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.orderList,
            data: {
                page: 1,
                count: 15
            },
            success: function (data) {
                var json = {
                    rows: data.rows
                };
                res.render('users/orders', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /*地址列表*/
    address: function (req, res, next) {
        //列表
        HttpClient.request(arguments, {
            url: API.addressList,
            success: function (data) {
                var json = {
                    rows: data.data
                };
                res.render('users/components/address', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });

    },
    /*编辑地址*/
    addressEdit: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.addressList,
            success: function (data) {
                var json = {}, list = data.data, len = list.length;
                for (var i = 0; i < len; i++) {
                    if (list[i].deliveryAddrId == req.body.id) {
                        json = list[i];
                        break;
                    }
                }
                res.render('users/components/address_edit', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    // 妈豆记录;
    beans: function (req, res, next) {
        //console.log(req)
        HttpClient.request(arguments, {
            url: API.MBeanList,
            data: {
                page: 1,
                pageSize: 20
            },
            success: function (data) {
                //console.log(data)
                // 重组数据;
                var json = {
                    name: "beans",
                    sum: data.mbeanCount, // 总妈豆数;
                    rows: []
                }, i = 0, mbeans = data.mbeans, l = mbeans.length;
                for (; i < l; i++) {
                    json.rows.push({
                        type: mbeans[i].mathOperator,       // 记录类型 0扣妈豆 1加妈豆;
                        title: mbeans[i].titleShow,         // 描述;
                        text: mbeans[i].mbeanNumShow,       // 数值;
                        date: mbeans[i].createDate          // 时间;
                    });
                }
                res.render('users/components/beans', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    // 我的积分;
    integral: function (req, res, next) {
        var params = req.body; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.MemberPoint,
            data: {
                type: +params.type, // 积分类型 0：GB,1:MC
                pageNo: 1,
                pageSize: 20
            },
            success: function (data) {
                res.render('users/components/integral', data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    // 我的优惠券;
    coupons: function (req, res, next) {
        if(req.body.ajax){
            //来源为分页请求
            var params = req.body; // 请求参数值;
            HttpClient.request(arguments, {
                url: API.coupons,
                data: params,
                success: function (data) {
                    data.request = params;
                    res.render('users/components/coupons_list', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        }else{
            /*bigPipe方案加载第一页数据*/
            var task = bigPipeTask.coupons;

            bigPipe.prototype.succeed = function () {
                var me = this;
                res.render('users/components/coupons', {}, function (err, html) {
                    var template = html + me.scripts.join('');
                    res.json({template: template});
                });
            };

            new bigPipe(task, arguments);
        }
    }

};


module.exports = center;
