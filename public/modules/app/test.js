define(function (require, exports, module) {

    require.async('cookie', function () {
        //var localInfo = $.cookie(CONST.local_cookie_location);
        //var base = new M.Base64();
        //alert(base.decode('eyJsbmciOjEyMC4xNTUwNywibGF0IjozMC4yNzQwODUsImNpdHljb2RlIjoiMDU3MSIsImFyZWFJZCI6IjMzMDEwNSIsInByb3ZpbmNlIjoi5rWZ5rGf55yBIiwiY2l0eSI6IuadreW3nuW4giIsImRpc3RyaWN0Ijoi5oux5aKF5Yy6Iiwic3RyZWV0Ijoi546v5Z+O5YyX6LevIiwic3RyZWV0TnVtYmVyIjoiMzE45Y+3IiwidG93bnNoaXAiOiLnsbPluILlt7fooZfpgZMiLCJmb3JtYXR0ZWRBZGRyZXNzIjoi5rWZ5rGf55yB5p2t5bee5biC5oux5aKF5Yy657Gz5biC5be36KGX6YGT5p2t5bee5biC5Lq65rCR5pS/5bqcIn0='));
        // $(".js-add-cookie").on("click", function () {
        //     var ba = 'eyJsbmciOjEyMC4xNTUwNywibGF0IjozMC4yNzQwODUsImNpdHljb2RlIjoiMDU3MSIsImFyZWFJZCI6IjMzMDEwNSIsInByb3ZpbmNlIjoi5rWZ5rGf55yBIiwiY2l0eSI6IuadreW3nuW4giIsImRpc3RyaWN0Ijoi5oux5aKF5Yy6Iiwic3RyZWV0Ijoi546v5Z+O5YyX6LevIiwic3RyZWV0TnVtYmVyIjoiMzE45Y+3IiwidG93bnNoaXAiOiLnsbPluILlt7fooZfpgZMiLCJmb3JtYXR0ZWRBZGRyZXNzIjoi5rWZ5rGf55yB5p2t5bee5biC5oux5aKF5Yy657Gz5biC5be36KGX6YGT5p2t5bee5biC5Lq65rCR5pS/5bqcIn0=';
        //     $.cookie('base64', M.url.query('c') || ba);
        //     alert('写入cookie：' + (M.url.query('c') || ba));
        // });
        var c = $.cookie('mmh_app_location');
        var base = new M.Base64();
        $(".js-location").html(c);
        $(".js-get-cookie").on("click", function () {
            alert(base.decode(c));
        });
        $(".js-location-cookie").on("click", function () {
            alert(c);
        });
    });

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
                //console.log('res---->', JSON.stringify(res));
                var html = ['<dt>Buckets List:(' + res.buckets.length + ')</dt>'];
                var buckets = $.map(res.buckets, function (v) {
                    return '<dd>' + v.name + '</dd>';
                }).join('');
                $('.ali-oss .buckets').empty().append(html + buckets);

                var files = ['<dt>File List:(' + res.fileList.objects.length + ')</dt>'];
                if (res.fileList.objects) {
                    var content = $.map(res.fileList.objects, function (v) {
                        return '<dd>' + v.name + '</dd>';
                    }).join('');
                }
                $('.ali-oss .files').empty().append(files + (content || ''));
            }
        });
    });


    //测试上传接口
    $('.js-upload').on('change', function (e) {
        var files = e.target.files;
        //console.log(file);

        var formData = new FormData();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (!file) return;
            formData.append('file', file);
        }

        M.ajax({
            type: 'post',
            url: '/test/ossUpload',
            cache: false,
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                console.log('res---->', JSON.stringify(res));
                $('.ali-oss .images').empty().append('<img src="' + res.url + '"/>');
                alert(res.msg);
            }
        });
    });


});