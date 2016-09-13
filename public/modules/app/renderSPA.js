define(function (require, exports, module) {

    module.exports = function (api_url, callback, params) {
        var info = {
            href: window.location.href
        };
        M.ajax({
            location: true,  //获取地理位置作为参数
            loadingDelay: typeof callback.loadingDelay === 'number' ? callback.loadingDelay : 300,
            url: api_url,
            data: params ? {data: JSON.stringify(params)} : {},
            success: function (res) {
                //console.log('success--->', res);
                //alert(JSON.stringify(res));
                var template = res.template;
                callback(null, template, info);
            },
            error: function (res) {
                if (/^(-1|1001)$/.test(res.error_code)) {
                    //未登录
                    return M.tips({
                        body: "您还未登录，请登录后再试！",
                        callback: function () {
                            location.href = '/login?origin=' + location.href;
                        }
                    });
                }
                var tips = res.statusText || res.msg || res.status + ' error';
                var arr = ['<div class="u-null-all"><div class="u-null"><dl><dt class="n-01"></dt>'];
                arr.push('<dd><p>' + tips + '</p>');
                arr.push('<a class="u-btn checked" href="javascript:location.reload();">刷新试试</a>');
                arr.push('</dd></dl></div></div>');
                callback(null, arr.join(''), info);
            }
        });
    };

});