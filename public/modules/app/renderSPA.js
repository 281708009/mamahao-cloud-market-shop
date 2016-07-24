define(function(require, exports, module) {

    module.exports = function (page, module, callback, params) {
        M.ajax({
            url: page.config.api[module],
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