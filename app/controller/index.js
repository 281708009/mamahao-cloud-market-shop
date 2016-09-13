/*渲染首页*/
var HttpClient = require("../utils/http_client"),
    API = require('../config/api');

exports.index = function (req, res, next) {
    log.info("exports.index");
    //log.info("req.query---->", JSON.stringify(req.query));
    if(req.query.debug){
        var defaults = {
            pageSize: 10,
            pageNo: 1
        };
        var params = req.body.data && JSON.parse(req.body.data) || {}; // 请求参数值;
        params = $.extend({}, defaults, req.params, params);
        //log.info("HttpClient----> index");
        HttpClient.request(arguments, {
            url: API.queryMainPage,
            data: params,
            success: function (data) {
                if(params.ajax){
                    console.log(data);
                }else{
                    res.render('index', {rows: data});
                }
            }
        });
    }else{
        //log.info("res.render----> wait", res.render);
        // 正式环境显示等待界面;
        return res.render('wait');
        //res.send('wait');
    }

};


exports.demo = function (req, res, next) {
    //临时设置登录代码 ==start
    //{"memberId":391,"token":"87e53c5879157637bfbc7d2a5ba95fa3"}
    //{"memberId":384,"token":"8e7e0e2ae5b65dbadae4ce15e1b1f28c"}
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
};