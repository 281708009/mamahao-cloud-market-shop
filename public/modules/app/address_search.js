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

        var $spa = $("#spa"),
            $result = $('#result'),
            $keywords = $('#keywords');

        //输入关键字
        $keywords.on('input', function () {
            var keywords = $keywords.val();
            if (!keywords) return false;
            // 高德地图 地址搜索
            AMap.service(["AMap.PlaceSearch"], function () {
                var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                    pageSize: 20,
                    pageIndex: 1,
                    city: params.areaId //城市
                });
                //关键字查询
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
            var data = $spa.data('data') || {},
                this_data = $this.data();

            data.gpsAddr = this_data.gps;
            data.lat = this_data.lat;
            data.lng = this_data.lng;

            $spa.data('data', data);
            window.history.go(-1);
        });

        // 隐藏顶部提示语
        $('.u-alert del').on('click', function () {
            $('.u-alert').slideUp();
        });
    };


});