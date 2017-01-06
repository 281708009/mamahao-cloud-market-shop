/*
 * 定位相关逻辑
 * by xqs 2016/07/28
 * 调用方式：
 *
 * require.async('app/location', function (obj) {
 *    obj.getLocation({
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
        // 是否为微信win端
        this.isWinWeChat = /windowswechat/gi.test(navigator.userAgent) ? true : false;

        //默认地理位置信息，杭州
        this.location = {
            city: "杭州市",
            areaId: 330102,
            lat: 30.22965,
            lng: 120.192567
        };

    }

    /*微信获取经纬度*/
    Location.prototype.wxLocation = function (params) {
        var me = this;
        params = params || {};

        //不是在微信内部打开
        if (!me.isWeChat || me.isWinWeChat) {

            //判断浏览器是否支持Geoloaction（基于浏览器的定位服务）
            //https://developer.mozilla.org/zh-CN/docs/Web/API/Geolocation/Using_geolocation
            //if (navigator.geolocation) {
            //    navigator.geolocation.getCurrentPosition(
            //        //success
            //        function (res) {
            //            me.location.lat = res.coords.latitude;
            //            me.location.lng = res.coords.longitude;
            //            console.info(res.address);
            //        },
            //        //error
            //        function (error) {
            //            switch (error.code) {
            //                //PERMISSION_DENIED: 1
            //                case error.PERMISSION_DENIED :
            //                    console.warn('您拒绝了使用位置共享服务，查询已取消');
            //                    break;
            //                //POSITION_UNAVAILABLE: 2
            //                case error.POSITION_UNAVAILABLE :
            //                    console.warn('位置不可知');
            //                    break;
            //                //TIMEOUT: 3
            //                case error.TIMEOUT :
            //                    console.warn('获取信息超时');
            //                    break;
            //            }
            //            console.warn(error.message);
            //        }
            //    );
            //} else {
            //    console.info('地理位置服务不可用');
            //}

            params.success && params.success.call(me, me.location);
            return false;
        }

        require.async('weixin', function (wx) {
            me.wx = wx;

            //初始化微信授权OK
            wx.ready(function () {
                wx.getLocation({
                    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (res) {
                        console.info('[getLocation succeed]', res);
                        var result = me.location = {
                            lat: res.latitude,  // 纬度，浮点数，范围为90 ~ -90
                            lng: res.longitude  // 经度，浮点数，范围为180 ~ -180。
                        };
                        params.success && params.success.call(me, result);
                    },
                    fail: function (res) {
                        console.error('[getLocation failed]', res.errMsg);
                        var result = $.extend({}, me.location);
                        result.error = 'failed';
                        params.success && params.success.call(me, result);
                    },
                    cancel: function (res) {
                        console.warn('[getLocation user cancelled]', res);
                        res.error = 'cancelled';
                        //M.tips('用户拒绝授权获取地理位置');
                        params.fail && params.fail.call(me, res);
                    }
                });
            });

        });


    };

    /*搜索周边*/
    Location.prototype.searchNearBy = function (params) {
        var me = this;
        params = params || {};
        var storageGPS = localStorage.getItem(CONST.local_store_gps), base = new M.Base64();
        var res = storageGPS ? JSON.parse(base.decode(storageGPS)) : {};
        AMap.service(["AMap.PlaceSearch"], function () {
            var placeSearch = new AMap.PlaceSearch();
            var coordinate = [res.lng, res.lat]; //中心点坐标
            placeSearch.searchNearBy('', coordinate, 500, function (status, result) {
                //console.log(JSON.stringify(result));
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

    };

    /*获取详细信息
     * 先判断本地存储是否有地址信息，没有的话调用wx和高德api获取信息后存储在本地。
     * */
    Location.prototype.getLocation = function (params) {
        var me = this;
        require.async('cookie', function () {
            params = params || {};
            var storageGPS = localStorage.getItem(CONST.local_store_gps), // GPS定位的地址;
                cookieGPS = $.cookie(CONST.local_cookie_location),      // 本地缓存的地址;
                base = new M.Base64();
            //判断本地存储
            if (cookieGPS){
                cookieGPS = JSON.parse(base.decode(cookieGPS));
                params.success && params.success.call(me, cookieGPS);
                // 校验本地缓存地址是否在有效果期内
                if(storageGPS && cookieGPS.timestamp && (+new Date() - Number(cookieGPS.timestamp) < 86400000)) return;
                //return false;
            }
            // 格式化本地的GPS定位信息;
            storageGPS = storageGPS ? JSON.parse(base.decode(storageGPS)) : {};
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
                                // 当前真实GPS定位地址
                                var newGPS = {
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
                                    formattedAddress: regeocode.formattedAddress,
                                    timestamp: +new Date() // 记录当前获取的时间
                                };
                                console.info("重新获取过来的定位地址------>", newGPS);
                                // Base64加密;
                                var baseGPS = base.encode(JSON.stringify(newGPS));
                                params.success && params.success.call(me, newGPS);

                                if(cookieGPS){
                                    // 本地的GPS城市与当前定位的GPS城市不符，更新本地的GPS定位数据;
                                    if(storageGPS.city != newGPS.city){
                                        me.saveLocation(baseGPS, "storage");
                                    }
                                    // 有本地信息，那么校验获取过来的和本地的是否在同一个城市;
                                    if(cookieGPS.city != newGPS.city){
                                        M.dialog({
                                            body: '您当前的定位城市为['+ newGPS.city +']，是否切换?',
                                            buttons: [
                                                {"text": "取消", "class": "", "onClick": function () {
                                                    cookieGPS.timestamp = +new Date(); // 记录当前修改的时间
                                                    cookieGPS.nolocal = true; // 非当前定位地址;
                                                    me.saveLocation(base.encode(JSON.stringify(cookieGPS)), "cookie");
                                                }},
                                                {"text": "确定", "class": "success", "onClick": function () {
                                                    me.saveLocation(baseGPS, "cookie");
                                                    M.reload();
                                                }}
                                            ]
                                        });
                                    }else{
                                        // 是否有标记为非当前定位地址;
                                        if(cookieGPS.nolocal){
                                            console.info("理论上不会走到这一步，多写一层防止错误");
                                            cookieGPS.timestamp = +new Date(); // 记录当前修改的时间
                                            delete cookieGPS.nolocal; // 删除此标记;
                                            me.saveLocation(base.encode(JSON.stringify(cookieGPS)), "cookie");
                                        }
                                    }
                                }else{
                                    // 本地无信息，存储获取过来的信息;
                                    me.saveLocation(baseGPS);
                                    M.reload();
                                }
                            } else {
                                if(!cookieGPS){
                                    //获取地址失败
                                    params.fail && params.fail.call(me, result);
                                }
                            }
                        });
                    })
                },
                fail: function (res) {//获取地址失败
                    params.fail && params.fail.call(me, res);
                }
            });
        });
    };

    // 存储定位地址
    Location.prototype.saveLocation = function (location, type) {
        if(!type || type == "cookie"){
            // 保存用户GPS定位地址至cookie，供node端使用;
            $.cookie(CONST.local_cookie_location, location, { expires: 365, path: '/' });
        }
        if(!type || type == "storage"){
            // 保存用户GPS定位地址，前端校验使用;
            localStorage.setItem(CONST.local_store_gps, location);
        }
    };


    module.exports = new Location();

});

