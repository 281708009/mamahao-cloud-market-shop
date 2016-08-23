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

        //获取地理位置信息
        require.async('app/location', function (fun) {
            fun.searchNearBy({
                success: function (res) {
                    page.renderModule('addressGPS', callback, res);
                },
                fail: function (res) {
                    var params = {
                        error: {
                            style: '03',
                            tips: '定位失败'
                        }
                    };
                    page.renderModule('addressGPS', callback, params);
                }
            });
        });

    }


});