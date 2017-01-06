/*渲染首页*/
var HttpClient = require("../utils/http_client"),
    API = require('../config/api');

var home = {
    index: function (req, res, next) {
        //log.info("exports.index");
        //log.info("req.query---->", JSON.stringify(req.query));
        var userAgent = req.header("user-agent");
        var isWeChat = /micromessenger/gi.test(userAgent),
            params = req.body.data && JSON.parse(req.body.data) || {}, // 请求参数值;
            query = req.query,
            defaults = { pageSize: 10, pageNo: 1 };
        params = $.extend({}, defaults, req.params, params);
        // 首页预览参数-仅支持微信端
        if(isWeChat && query.date){
            params.date = query.date;
            params.openId = req.session.wechat_auth.openid;
        }
        //log.info("HttpClient----> index");
        HttpClient.request(arguments, {
            url: params.date ? API.previewMainPage : API.queryMainPage,
            data: params,
            success: function (data) {
                if(params.ajax){
                    console.log(data);
                }else{
                    res.render('index', {rows: data});
                }
            }
        });
    },
    // 摇妈豆;
    beans: function (req, res, next) {
        var defaults = {
            isMamahao: /mamhao|mamahao/gi.test(req.header("user-agent")),
            friend: req.query.r,  // 分享人的 memberId
            isIos: /iphone|ipod|ipad/gi.test(req.header("user-agent"))
        },
        session = req.session;
        if(session.user){
            defaults.id = session.user.memberId;
        }
        log.info("cookies----->", JSON.stringify(req.cookies));
        //$.extend({}, defaults, req.query);
        HttpClient.request(arguments, {
            url: API.getMbeanPossibleCount,
            data: {start: 0, end: 30},
            success: function (data) {
                res.render('beans/index', $.extend({}, defaults, {rows: data}));
            }
        });
    },
    // 内部用户摇妈豆;
    shakeBeans: function (req, res, next) {
        var params = req.body || {},
            session = req.session;
        log.info("摇妈豆--session---->", JSON.stringify(session));
        if(params.id && params.friend){
            // 在微信端，并且传了他人的用户ID那么为他人摇取妈豆;
            log.info("给他人摇妈豆", params.id);
            HttpClient.request(arguments, {
                url: API.getActiveMbeansByExtApp,
                data: {memberId: params.id},
                success: function (data) {
                    res.json(data);
                }
            });
        }else if(session.user && session.user.memberId){
            // 用户已登录 - 摇取妈豆;
            log.info("给自己摇妈豆");
            HttpClient.request(arguments, {
                url: API.getActiveMbeans,
                success: function (data) {
                    res.json(data);
                }
            });
        }else{
            // 用户未登录 - 提示登录;
            res.json({noLogin: true, code: 200});
        }
    },
    // 环信客服
    im: function (req, res, next) {
        res.render('im/index');
    },
    // js sdk
    routes: function (req, res, next) {
        res.render('routes');
    },
    // 测试页面;
    demo: function (req, res, next) {
        //临时设置登录代码 ==start
        //{"memberId":391,"token":"87e53c5879157637bfbc7d2a5ba95fa3"}
        //{"memberId":384,"token":"8e7e0e2ae5b65dbadae4ce15e1b1f28c"}
        if(req.query.debug){
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
                "memberId": 379,
                "memberName": null,
                "memberNickName": "小圆子",
                "memberType": 0,
                "perfectInfo": true,
                "phone": "15267436078",
                "shareRoleType": null,
                "token": "1bb7c599fe99c1111c08ff93adb45e55",
                "vip": false,
                "vipLevel": null,
                "vipLevelLogo": null,
                "vipLevelName": null,
                "vipLevelSmallLogo": null,
                "weixinOpenId": null,
                "weixinUnoinId": null
            };
            //设置session
            var user = $.extend(req.session.user, data);
            req.session.user = user;//设置当前用户到session
            //==end

            var json = {
                avatar: 'https://avatars2.githubusercontent.com/u/6917388?v=3&s=64',
                nickName: '妈妈好'
            };
            res.render('demo/index', json);
        }
    }
};
module.exports = home;