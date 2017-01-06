var HttpClient = require("../utils/http_client"),
    bigPipe = require("../utils/bigPipe"),
    bigPipeTask = require('../config/bigPipeTask'),
    API = require('../config/api');

/*到个人主页*/
var center = {
    index: function (req, res, next) {
        res.render('users/index');
    },
    center: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.center,
            data: params,
            success: function (data) {
                var session_user = req.session.user || {};  // 用户基本信息数据;
                data = $.extend({}, data, session_user);
                res.render('users/components/center', data, function (err, html) {
                    err && log.error(err);
                    res.json({template: html});
                });
            }
        });
    },
    //个人信息相关
    profile: function (req, res, next) {
        var session_user = req.session.user;  // 用户基本信息数据;
        if (session_user) {
            res.render('users/profile', session_user, function (err, html) {
                err && log.error(err);
                res.json({template: html});
            });
        } else {
            res.json({error_code: -1, msg: '用户未登录或登录已过期'});
        }
    },
    profileEdit: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        var session_user = req.session.user;  // 用户基本信息数据;
        if (session_user) {
            session_user.request = params;
            res.render('users/profile_edit', session_user, function (err, html) {
                err && log.error(err);
                res.json({template: html});
            });
        } else {
            res.json({error_code: -1, msg: '用户未登录或登录已过期'});
        }

    },
    //更新个人信息缓存
    updateProfileCache: function (req, res, next) {
        HttpClient.request(arguments, {
            url: API.profile,
            success: function (data) {
                var updateData = {
                    phone: data.mobile,
                    memberNickName: data.nickname,
                    headPic: data.avatar,
                    defaultGeo: data.defaultGeo,
                    defaultCityId: data.defaultCityId,
                    defaultAreaId: data.defaultAreaId,
                    babyCnt: data.babyCnt,
                    breedStatus: data.breedStatus,
                    perfectInfo: data.perfectInfo,
                    vip: data.vip,
                    vipLevel: data.vipLevel,
                    vipLevelLogo: data.vipLevelLogo,
                    vipLevelName: data.vipLevelName,
                    vipLevelSmallLogo: data.vipLevelSmallLogo,
                    babies: data.babies,
                    duoDate: data.duoDate,
                    duoDateStr: data.duoDateStr,
                    memberType: data.memberType,
                };
                req.session.user = $.extend(req.session.user, updateData);
                res.json({success: true});
            }
        });
    },
    profileUpdate: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.profile_update,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    profileGeoUpdate: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.profile_geo_update,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    breedAdd: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.breed_add,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    breedUpdate: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.breed_update,
            data: params,
            success: function (data) {
                res.json(data);
            }
        });
    },
    breedDelete: function (req, res, next) {
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        HttpClient.request(arguments, {
            url: API.breed_delete,
            data: params,
            success: function (data) {
                res.json(data);
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
            new bigPipe(task, arguments, {
                succeed: function () {
                    var me = this;
                    res.render('users/components/integral', {data: me.data}, function (err, html) {
                        var template = html + me.scripts.join('');
                        res.json({template: template});
                    });
                }
            });
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
            new bigPipe(task, arguments, {
                succeed: function () {
                    var me = this;
                    res.render('users/components/coupons', {}, function (err, html) {
                        var template = html + me.scripts.join('');
                        res.json({template: template});
                    });
                }
            });
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
    },
    // 用户选择身份
    identity: function (req, res, next) {
        res.render('users/identity');
    }

};


module.exports = center;
