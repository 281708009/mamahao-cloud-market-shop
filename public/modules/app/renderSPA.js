define(function(require, exports, module) {

    module.exports = function (api_url, callback, params) {
        M.ajax({
            loadingDelay: typeof callback.loadingDelay === 'number' ? callback.loadingDelay : 300,
            url: api_url,
            data: params ? {data: JSON.stringify(params)} : {},
            success: function (res) {
                console.log('success--->', res);
                var template = res.template;
                callback(null, template);
            },
            error: function (res) {
                var template = res.status + 'error';
                callback(null, template);
                console.log('show error template')
            }
        });
    };

});