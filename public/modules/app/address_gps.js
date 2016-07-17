define(function (require, exports, module) {

    //构造函数
    function pageFunc(page, callback) {
        this.page = page;
        this.callback = callback;
    }

    //导出
    module.exports = pageFunc;

    //渲染页面
    pageFunc.prototype.render = function () {
        var me = this, page = me.page, callback = me.callback;
        require('AMap');  //加载高德sdk
        require.async('weixin', function (wx) {
            //初始化微信授权
            M.wx.init(wx, {
                ready: fn_getLocation
            });

            //获取微信地理位置坐标
            function fn_getLocation() {
                wx.getLocation({
                    type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                    success: function (res) {
                        var params = {
                            lat: res.latitude,  // 纬度，浮点数，范围为90 ~ -90
                            lng: res.longitude  // 经度，浮点数，范围为180 ~ -180。
                        };
                        fn_searchNearBy(params);
                    },
                    fail: function (res) {
                        console.error('[getLocation failed]', res.errMsg);

                        var error = {
                            style: '03',
                            tips: '定位失败'
                        };
                        var params = {
                            data: JSON.stringify({error: error})
                        };
                        page.renderModule('addressGPS', callback, params);
                    }
                });
            }

            //高德API查询周边地址列表
            function fn_searchNearBy(params) {
                AMap.service(["AMap.PlaceSearch"], function () {
                    var placeSearch = new AMap.PlaceSearch();

                    var cpoint = [params.lng, params.lat]; //中心点坐标
                    placeSearch.searchNearBy('', cpoint, 500, function (status, result) {
                        console.log(JSON.stringify(result));
                        var poiList = [];
                        if (result.info === 'OK') {
                            poiList = result.poiList.pois;
                            poiList.sort(function (a, b) {
                                return a.distance - b.distance;  //按照距离排序
                            });
                        }
                        var params = {data: JSON.stringify(poiList)};
                        page.renderModule('addressGPS', callback, params);
                    });
                });
            }
        });
    }


});