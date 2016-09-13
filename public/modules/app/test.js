define(function (require, exports, module) {

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
                var html = ['<dt>Buckets List:</dt>'];
                var buckets = $.map(res.buckets, function (v) {
                    return '<dd>' + v.name + '</dd>';
                }).join('');
                var files = ['<dt>File List:</dt>'];
                if (res.fileList.objects) {
                    var content = $.map(res.fileList.objects, function (v) {
                        return '<dd>' + v.name + '</dd>';
                    }).join('');
                }
                $('.ali-oss .content').empty().append(html + buckets + files + (content || ''));
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
                $('.ali-oss .content').empty().append('<img src="' + res.url + '"/>');
                alert(res.msg);
            }
        });
    });


});