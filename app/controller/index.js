/*渲染首页*/
exports.index = function (req, res, next) {
    res.render("index");
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
        "memberId": 384,
        "memberName": null,
        "memberNickName": "hmm2861",
        "memberType": 0,
        "perfectInfo": true,
        "phone": "18668035676",
        "shareRoleType": null,
        "token": "8e7e0e2ae5b65dbadae4ce15e1b1f28c",
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