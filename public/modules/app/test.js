define(function(require, exports, module) {

    //测试request
    M.ajax({
        url: '/test/request',
        data: {},
        success: function (res) {
            console.log('res---->', JSON.stringify(res))
            var html = '<script>function show(m){console.log(m)}<\/script><script>show("' + res.id + '");<\/script>';
            $('body').append(html);
        }
    });


    //测试ali-oss
    $('.js-ali-oss').on('click', function () {
        M.ajax({
            url: '/test/ali-oss',
            data: {},
            success: function (res) {
                console.log('res---->', JSON.stringify(res))
            }
        });
    });



});