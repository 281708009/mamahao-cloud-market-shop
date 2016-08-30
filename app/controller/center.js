var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api');

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

    /*地址列表*/
    address: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.addressList,
            success: function (data) {
                var json = {
                    rows: data.data,
                    request: params
                };
                res.render('users/components/address', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /*编辑地址*/
    addressEdit: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.addressList,
            success: function (data) {
                var json = {}, list = data.data, len = list.length;
                for (var i = 0; i < len; i++) {
                    if (list[i].deliveryAddrId == params.id) {
                        json = list[i];
                        break;
                    }
                }
                json.request = params;
                res.render('users/components/address_edit', json, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    /*地址GPS列表*/
    addressGPS: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        res.render('users/components/address_gps', {data: params}, function (err, html) {
            //console.log(html)
            res.json({template: html});
        });
    },
    /*删除地址*/
    doAddressDelete: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.deleteAddress,
            data: params,
            success: function (data) {
                if (data.success_code === 200) {
                    data.success = true;
                }
                res.json(data);
            }
        });
    },
    /*保存地址*/
    doAddressSave: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: params.deliveryAddrId ? API.updateAddress : API.addAddress,
            data: params,
            success: function (data) {
                if (data.success_code === 200) {
                    data.success = true;
                }
                res.json(data);
            }
        });
    },
    /*查询省市区*/
    queryAddressArea: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.queryArea,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    // 妈豆记录;
    beans: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var pugFile = params.ajax ? 'lists/bean' : 'users/components/beans';
        var defaults = {
            page: 1,
            pageSize: 20
        };
        params = $.extend({}, defaults, params);

        HttpClient.request(arguments, {
            url: API.MBeanList,
            data: params,
            success: function (data) {
                //console.log(data)
                res.render(pugFile, data, function (err, html) {
                    res.json({template: html});
                });
            }
        });
    },
    // 我的积分;
    integral: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        if (params.ajax) {
            //来源为分页请求
            HttpClient.request(arguments, {
                url: API.integral,
                data: params,
                success: function (data) {
                    res.render('lists/integral', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        } else {
            /*bigPipe方案加载第一页数据*/
            var task = bigPipeTask.integral;

            bigPipe.prototype.succeed = function () {
                var me = this;
                res.render('users/components/integral', {data: me.data}, function (err, html) {
                    var template = html + me.scripts.join('');
                    res.json({template: template});
                });
            };

            new bigPipe(task, arguments);
        }
    },
    // 我的优惠券;
    coupons: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        if (params.ajax) {
            //来源为分页请求
            HttpClient.request(arguments, {
                url: API.coupons,
                data: params,
                success: function (data) {
                    res.render('lists/coupon', data, function (err, html) {
                        res.json({template: html});
                    });
                }
            });
        } else {
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
    },
    //领券
    couponsReceive: function (req, res, next) {
        var params = req.body;
        HttpClient.request(arguments, {
            url: API.couponsReceive,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    //兑换券
    couponsExchange: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.couponsExchange,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    }

};


module.exports = center;
