var HttpClient = require("../utils/http_client");
var API = require('../config/api');

/*
* 用户有关的处理
* */
var users = {
    /*
    * 首页
    * */
    index: function (req, res, next) {
        res.render('index');
    },
    /*
    * 登录
    * */
    login: function (req,res,next) {
        res.render('users/login', {title: 'login'});
    },
    /*
    * 用户中心
    * */
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
            res.render('users/center', data);
        },
        address: function (req, res, next) {
            var data = {
                title: "我的地址",
                rows: [
                    {
                        id: 1,
                        default: true,
                        name: '夏青松',
                        mobile: '15257182861',
                        address: '浙江省杭州市上城区中豪望江国际1幢9层 妈妈好网络'
                    },
                    {
                        id: 2,
                        default: false,
                        name: '小龙',
                        mobile: '15257188888',
                        address: '浙江省杭州市上城区中豪望江国际1幢9层 妈妈好网络'
                    }
                ]
            };
            res.render('users/components/address', data);
        },
        addressEdit: function (req, res, next) {
            console.log(req.body.id)
            var data = {
                name: "夏青松",
                mobile: "15257182861",
                district: "浙江省杭州市上城区",
                street: "望江东路332号",
                house_number: "中豪望江国际1幢9层 妈妈好网络"
            };
            res.render('users/components/address_edit', data);
        },
        // 妈豆记录;
        beans: function (req, res, next) {
            //console.log(req)
            var userInfo = req.session.user; // 用户基本信息数据;
            HttpClient.request({
                req: req,
                url: API.MBeanList,
                data: {
                    memberId: userInfo.id,
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
                    for(; i < l; i++){
                        d.rows.push({
                            type: mbeans[i].mathOperator,       // 记录类型 0扣妈豆 1加妈豆;
                            title: mbeans[i].titleShow,         // 描述;
                            text: mbeans[i].mbeanNumShow,       // 数值;
                            date: mbeans[i].createDate          // 时间;
                        });
                    }
                    res.render('users/components/beans', d);
                },
                error: function (data) {

                }
            });
        },
        // 我的积分;
        integral: function (req, res, next) {
            var userInfo = req.session.user, // 用户基本信息数据;
                params = req.body; // 请求参数值;
            //console.log(userInfo);
            HttpClient.request({
                req: req,
                url: API.MemberPoint,
                data: {
                    memberId: userInfo.id,
                    type: params.type, // 积分类型 0：GB,1:MC
                    pageNo: 1,
                    pageSize: 20
                },
                success: function (data) {
                    console.log(data)
                    res.render('users/components/integral', data);
                },
                error: function (data) {

                }
            });
        }
    },
    /*
    * 分类
    * */
    category: function (req, res, next) {
        res.render('category/index',{info: 'category'});
    },
    /*
    * 门店
    * */
    store: function (req, res, next) {
        res.render('store/index',{info: 'store'});
    },
    /*
    * 用户中心
    * */
    cart: function (req, res, next) {
        res.render('cart/index',{info: 'cart'});
    }
};

module.exports = users;