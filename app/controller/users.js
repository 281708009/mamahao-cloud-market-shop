var HttpClient = require("../utils/http_client");
var channelId = AppConfig.site.channel.id;
var API = require('../config/api');

/**
 * 登录相关处理
 */
var users = {
    demo: function (req, res, next) {
        //临时设置登录代码 ==start
        var data = {
            "babies": null,
            "babyCnt": 0,
            "breedStatus": 1,
            "defaultAddr": {
                "addrDetail": "1234",
                "area": "拱墅区",
                "areaId": "330105",
                "city": "杭州市",
                "consignee": "xiaqingson",
                "deliveryAddrId": 688,
                "gpsAddr": "浙江省杭州市拱墅区AI(香港)景观兴建筑设计有限公司",
                "isDefault": 1,
                "lat": 30.284588,
                "lng": 120.15154,
                "phone": "15257182861",
                "prv": "浙江",
                "telephone": null
            },
            "defaultAreaId": 330108,
            "defaultCityId": 330100,
            "defaultGeo": {
                "areaId": 330108,
                "areaName": "滨江区",
                "cityId": 330100,
                "cityName": "杭州市",
                "provinceId": 330000,
                "provinceName": "浙江"
            },
            "duoDate": 1465833600000,
            "duoDateStr": "2016-06-14",
            "headPic": "http://cmi.mamhao.cn/member-head-images/defaultHeadPic/huaiyun.png",
            "isFirstLogin": 0,
            "memberId": 391,
            "memberName": null,
            "memberNickName": "hmm2861",
            "memberType": 0,
            "perfectInfo": true,
            "phone": "15257182861",
            "shareRoleType": null,
            "token": "87e53c5879157637bfbc7d2a5ba95fa3",
            "vip": false,
            "vipLevel": null,
            "vipLevelLogo": null,
            "vipLevelName": null,
            "vipLevelSmallLogo": null,
            "weixinOpenId": null,
            "weixinUnoinId": null
        };
        //设置session
        var user = {
            id: data.memberId,
            token: data.token,
            nickname: data.memberNickName,
            avatar: data.headPic
        };
        req.session.user = user;//设置当前用户到session
        //==end

        var json = {
            avatar: 'https://avatars2.githubusercontent.com/u/6917388?v=3&s=64',
            nickName: '妈妈好'
        };
        res.render('demo/index', json);
    },
    /*到登录页*/
    toLogin: function (req, res, next) {
        if (req.session.user) {
            res.redirect('/index');
        } else {
            res.render('account/login', {title: "妈妈好微商城-登录"});
        }
    },
    /*请求登录*/
    doLogin: function (req, res, next) {
        var mobile = req.body.mobile, vcode = req.body.vcode;
        HttpClient.request(req, {
            url: API.login,
            data: {
                phone: mobile,
                vcode: vcode,
                from: channelId
            },
            success: function (data) {
                console.log('success---->' + JSON.stringify(data))
                // var json = JSON.parse(data);
                //登录成功设置session
                var user = {
                    id: data.memberId,
                    token: data.token,
                    nickname: data.memberNickName,
                    avatar: data.headPic
                };
                req.session.user = user;//设置当前用户到session
                res.json({success: true, msg: "登录成功！"});
            },
            error: function (data) {
                console.log('error---->', data);
                res.json({error_code: data.error_code, msg: data.error});
            }
        });
    },
    /*登出*/
    logout: function (req, res, next) {
        req.session.user = null;
        res.locals.success = "登录成功";
        res.redirect('/');
    },
    /*发送验证码*/
    sendMessage: function (req, res, next) {
        var mobile = req.body.mobile;
        HttpClient.request(req, {
            url: API.vcode,
            data: {
                phone: mobile
            },
            success: function (data) {
                res.json(data);
            }
        });
    },
    /*到个人主页*/
    center: {
        index: function (req, res, next) {
            var data = {
                avatar: 'http://cmi.mamhao.cn/member-head-images/32/aef701b886df7222dc4ff984709c283a.jpg',
                nickName: '夏青松',
                wallet: {
                    beans: 9166,
                    coupons: 10,
                    gb: 105,
                    mc: 0
                }
            };
            res.render('users/index', data);
        },
        /*订单列表*/
        orders: function (req, res, next) {
            HttpClient.request(req, {
                url: API.orderList,
                data: {
                    page: 1,
                    count: 15
                },
                success: function (data) {
                    var json = {
                        rows: data.rows
                    };
                    res.render('users/orders', json);
                }
            });

        },
        /*地址列表*/
        address: function (req, res, next) {
            HttpClient.request(req, {
                url: API.addressList,
                success: function (data) {
                    var json = {
                        rows: data.data
                    };
                    res.render('users/components/address', json);
                }
            });

        },
        /*编辑地址*/
        addressEdit: function (req, res, next) {
            /*取地址列表*/
            HttpClient.request(req, {
                url: API.addressList,
                success: function (data) {
                    var json = {}, list = data.data, len = list.length;
                    for (var i = 0; i < len; i++) {
                        if (list[i].deliveryAddrId == req.body.id) {
                            json = list[i];
                            break;
                        }
                    }
                    res.render('users/components/address_edit', json);
                }
            });
        },
        // 妈豆记录;
        beans: function (req, res, next) {
            //console.log(req)
            var userInfo = req.session.user; // 用户基本信息数据;
            HttpClient.request(req, {
                url: API.MBeanList,
                data: {
                    page: 1,
                    pageSize: 20
                },
                success: function (data) {
                    //console.log(data)
                    // 重组数据;
                    var d = {
                        name: "beans",
                        sum: data.mbeanCount, // 总妈豆数;
                        rows: []
                    }, i = 0, mbeans = data.mbeans, l = mbeans.length;
                    for (; i < l; i++) {
                        d.rows.push({
                            type: mbeans[i].mathOperator,       // 记录类型 0扣妈豆 1加妈豆;
                            title: mbeans[i].titleShow,         // 描述;
                            text: mbeans[i].mbeanNumShow,       // 数值;
                            date: mbeans[i].createDate          // 时间;
                        });
                    }
                    res.render('users/components/beans', d);
                }
            });
        },
        // 我的积分;
        integral: function (req, res, next) {
            var params = req.body; // 请求参数值;
            HttpClient.request(req, {
                url: API.MemberPoint,
                data: {
                    type: +params.type, // 积分类型 0：GB,1:MC
                    pageNo: 1,
                    pageSize: 20
                },
                success: function (data) {
                    res.render('users/components/integral', data);
                }
            });
        },
        // 我的优惠券;
        coupons: function (req, res, next) {
            HttpClient.request(req, {
                url: API.coupons,
                data: {
                    page: 1,
                    pageSize: 20,
                    status: 4
                },
                success: function (data) {
                    res.render('users/components/coupons', data);
                }
            });
        }

    }
};

module.exports = users;
