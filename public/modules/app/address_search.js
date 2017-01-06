define(function (require, exports, module) {

    //构造函数
    function pageFunc(params) {
        this.params = params;
    }

    //导出
    module.exports = pageFunc;

    //渲染页面
    pageFunc.prototype.render = function () {
        var me = this;

        require('AMap');  //加载高德sdk

        me.bind(); //绑定事件

    };

    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this, params = me.params;

        var $app = $("#app"),
            $result = $('#result'),
            $keywords = $('#keywords');

        //输入关键字
        $keywords.on('input', function () {
            var keywords = $.trim($(this).val());
            if (!keywords) return false;
            // 高德地图 地址搜索
            AMap.service(["AMap.PlaceSearch"], function () {
                var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                    pageSize: 20,
                    pageIndex: 1,
                    city: params.areaId //城市
                });
                //关键字查询
                if (keywords && params.province) {
                    params.province = decodeURIComponent(params.province);
                    //关键字加上省份，提高精度；
                    // 解决bug：如选择上海黄浦区搜索杭州万泰城可以搜索到；
                    keywords = params.province + keywords;
                }

                placeSearch.search(keywords, function (status, result) {
                    //console.log(status, JSON.stringify(result));
                    $result.empty();
                    if (status == 'complete') {
                        var i = 0, list = result.poiList.pois || [];
                        for (i; i < list.length; i++) {
                            var li = $('<li><dl><dt>' + list[i].name + '</dt><dd>' + list[i].address + '</dd></dl></li>').data({
                                gps: list[i].name,
                                lng: list[i].location.lng,
                                lat: list[i].location.lat,
                                address: list[i].address
                            });
                            $result.append(li);
                        }
                    }
                });
            });
        });

        // 点击单条结果跳转到前一页地址编辑页面
        $result.on('click', 'li', function () {
            var $this = $(this);
            var data = $app.data('data') || {},
                thisInfo = $this.data();

            AMap.service('AMap.Geocoder', function () {//回调函数
                //实例化Geocoder,使用geocoder 对象完成相关功能
                var geocoder = new AMap.Geocoder();

                //逆向地理编码（坐标-地址）
                var coordinate = [thisInfo.lng, thisInfo.lat];//坐标
                geocoder.getAddress(coordinate, function (status, result) {
                    //console.log(JSON.stringify(result));
                    if (status === 'complete' && result.info === 'OK') {
                        //获得了有效的地址信息:
                        //即，result.regeocode.formattedAddress
                        var regeocode = result.regeocode, detail = regeocode.addressComponent;
                        console.log(detail);
                        detail.province = detail.province.replace(/省$/, ''); //忽略最后一个'省'字

                        var data = $app.data('data') || {};
                        data.gpsAddr = thisInfo.gps;
                        data.district = [detail.province, detail.city, detail.district].join('');
                        data.areaId = detail.adcode;
                        data.prv = detail.province;
                        data.city = detail.city;
                        data.area = detail.district;

                        data.lat = thisInfo.lat;
                        data.lng = thisInfo.lng;

                        $app.data('data', data);
                        window.history.go(-1);
                    }
                });
            });
        });

        // 隐藏顶部提示语
        $('.u-alert del').on('click', function () {
            $('.u-alert').slideUp();
        });
    };


});