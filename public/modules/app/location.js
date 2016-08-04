/*
 * 定位相关逻辑
 * by xqs 2016/07/28
 * 调用方式：
 *
 * require.async('app/location', function (obj) {
 *    new obj().getLocation({
 *       success: function (res) {
 *          console.log(res)
 *       },
 *       fail: function () {
 *       }
 *   });
 * })
 *
 * */

define(function (require, exports, module) {


    function Location() {
        //判断是否为微信浏览器
        this.isWeChat = /MicroMessenger/gi.test(navigator.userAgent) ? true : false;

        //默认地理位置信息，杭州
        this.location = {
            areaId: 330102,
            lat: 30.22965,
            lng: 120.192567
        };
    }

    /*微信获取经纬度*/
    Location.prototype.wxLocation = function (params) {
        var me = this, params = params || {};

        /*初始化，引用微信和高德的jsAPI*/
        require('AMap');   //加载高德sdk

        //不是在微信内部打开
        if(!me.isWeChat){
            params.success && params.success.call(me, me.location);
            return false;
        }

        require.async('weixin', function (wx) {
            me.wx = wx;
            //初始化微信授权
            M.wx.init(wx, {
                ready: function () {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
                            console.info('[getLocation succeed]', res);
                            me.location = {
                                lat: res.latitude,  // 纬度，浮点数，范围为90 ~ -90
                                lng: res.longitude  // 经度，浮点数，范围为180 ~ -180。
                            };
                            params.success && params.success.call(me, me.location);
                        },
                        fail: function (res) {
                            console.error('[getLocation failed]', res.errMsg);
                            res.error = 'failed';
                            params.fail && params.fail.call(me, res);
                        },
                        cancel: function (res) {
                            console.warn('[getLocation user cancelled]', res);
                            res.error = 'cancelled';
                            //M.tips('用户拒绝授权获取地理位置');
                            params.fail && params.fail.call(me, res);
                        }
                    });
                }
            });
        });


    };

    /*搜索周边*/
    Location.prototype.searchNearBy = function (params) {
        var me = this, params = params || {};

        me.wxLocation({
            success: function (res) {
                AMap.service(["AMap.PlaceSearch"], function () {
                    var placeSearch = new AMap.PlaceSearch();

                    var coordinate = [res.lng, res.lat]; //中心点坐标
                    placeSearch.searchNearBy('', coordinate, 500, function (status, result) {
                        console.log(JSON.stringify(result));
                        var poiList = [];
                        if (result.info === 'OK') {
                            poiList = result.poiList.pois;
                            poiList.sort(function (a, b) {
                                return a.distance - b.distance;  //按照距离排序
                            });
                        }
                        params.success && params.success.call(me, poiList);
                    });
                });
            },
            fail: function (res) {//获取地址失败
                params.fail && params.fail.call(me, res);
            }
        });

    };

    /*获取详细信息
     * 先判断本地存储是否有地址信息，没有的话调用wx和高德api获取信息后存储在本地。
     * */
    Location.prototype.getLocation = function (params) {
        var me = this, params = params || {};

        //判断本地存储
        if (localStorage.getItem(CONST.local_location)) {
            var info = JSON.parse(localStorage.getItem(CONST.local_location));
            params.success && params.success.call(me, info);
            return false;
        }

        //调用微信定位接口
        me.wxLocation({
            success: function (res) {
                AMap.service('AMap.Geocoder', function () {//回调函数
                    //实例化Geocoder,使用geocoder 对象完成相关功能
                    var geocoder = new AMap.Geocoder();

                    //逆向地理编码（坐标-地址）
                    var coordinate = [res.lng, res.lat];//坐标
                    geocoder.getAddress(coordinate, function (status, result) {
                        console.log(JSON.stringify(result));
                        if (status === 'complete' && result.info === 'OK') {
                            //获得了有效的地址信息:
                            //即，result.regeocode.formattedAddress
                            var regeocode = result.regeocode, detail = regeocode.addressComponent;
                            var info = {
                                lng: res.lng,
                                lat: res.lat,
                                citycode: detail.citycode,
                                areaId: detail.adcode,
                                province: detail.province,
                                city: detail.city,
                                district: detail.district,
                                street: detail.street,
                                streetNumber: detail.streetNumber,
                                township: detail.township,
                                formattedAddress: regeocode.formattedAddress
                            };

                            //本地存储
                            localStorage.setItem(CONST.local_location, JSON.stringify(info));

                            params.success && params.success.call(me, info);
                        } else {
                            //获取地址失败
                            params.fail && params.fail.call(me, result);
                        }
                    });
                })
            },
            fail: function (res) {//获取地址失败
                params.fail && params.fail.call(me, res);
            }
        });

    };


    module.exports = Location;

});

