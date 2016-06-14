/*
 * common.js
 * by xqs 160613
 * */

(function () {
    var MMH = {
        config: {},
        init: function () {
            /*FastClick 解决click事件移动端300ms延迟的问题*/
            if ('addEventListener' in document) {
                document.addEventListener('DOMContentLoaded', function () {
                    FastClick.attach(document.body);
                }, false);
            }
        },
        /*ajax请求*/
        ajax: function (params) {
            var c = MMH.config;

            /*超时显示loading*/
            var $loading = $('.loading');
            if (c.isAjax) return false;
            c.isAjax = true;  //正在ajax请求
            var timer = setTimeout(function () {
                clearTimeout(timer);
                c.isAjax && $loading.show();  //200ms之后显示loading遮罩
            }, 200);

            /*do ajax*/
            $.ajax({
                type: params.type || "POST",
                url: params.url || "/",
                data: params.data || {},
                dataType: params.dataType || "json",
                timeout: 2e4,  //20s
                success: function (res) {
                    params.success && params.success.call(this, res);
                },
                error: function (res) {
                    //console.log('error--->',res)
                    if (params.error) {
                        params.error.call(this, res);
                    } else {
                        var errorMsg = res.msg || res.statusText;
                        MMH.tips(errorMsg);
                    }
                },
                complete: function (res) {
                    //console.log('complete--->',res)
                    c.isAjax = false;
                    $loading.hide();
                    params.complete && params.complete.call(this, res);
                }
            });
        },
        /*tips提示框*/
        tips: function (args) {
            if (!$('.ui-tips-wrap')[0]) {
                var dom = ['<div class="ui-tips-wrap">', '<div class="ui-mask ui-mask-transparent"></div>', '<div class="ui-tips">', '<div class="ui-tips-bd"></div></div></div>'];
                $('body').append(dom.join(''));
            }
            var container = $('.ui-tips-wrap');
            var params = {
                delay: 2000,
                callback: null
            };
            Object.prototype.toString.call(args) !== '[object Object]' ? params.body = ('' + args) : $.extend(params, args || {});
            params.body && container.show().find('.ui-tips-bd').html(params.body);
            var timer = setTimeout(function () {
                clearTimeout(timer);
                container.hide();
                params.callback && params.callback.call(this);
            }, params.delay || 2000);
        },
        /*dialog对话框*/
        dialog: function (args) {
            var fun = {
                elements: {},
                init: function () {
                    var o = fun.elements;
                    if (!$('.ui-dialog-wrap')[0]) {
                        var dom = ['<div class="ui-dialog-wrap">', '<div class="ui-mask"></div>', '<div class="ui-dialog">', '<div class="ui-dialog-hd"></div>', '<div class="ui-dialog-bd"></div>', '<div class="ui-dialog-ft"></div>', '</div></div>'];
                        $('body').append(dom.join(''));
                    }
                    o.container = $('.ui-dialog-wrap');
                    o.hd = $('.ui-dialog-hd');
                    o.bd = $('.ui-dialog-bd');
                    o.ft = $('.ui-dialog-ft');

                    var defaults = {
                        body: '模态框内容',
                        buttons: ['确定', '取消'],
                        confirm: null,
                        cancel: null
                    };
                    var params = fun.params = $.extend({}, defaults, args || {});
                    o.bd.html(params.body);
                    params.title && o.hd.html(params.title);
                    o.ft.empty().append(function () {
                        return $.map(params.buttons, function (item, index) {
                            var btnClass = index === 0 ? 'btn-primary' : 'btn-reverse';
                            return ['<button class="btn ' + btnClass + '">' + item + '</button>'];
                        }).join('');
                    });

                    fun.show();
                },
                show: function () {
                    var o = fun.elements, params = fun.params;
                    o.container.addClass('show').removeClass('hide');

                    /*bind events*/
                    o.ft.on('click', '.btn:eq(0)', function () {
                        params.confirm ? params.confirm.call(this) : fun.hide();
                    });
                    o.ft.on('click', '.btn:eq(1)', function () {
                        params.cancel ? params.cancel.call(this) : fun.hide();
                    });
                },
                hide: function () {
                    var o = fun.elements;
                    o.container.removeClass('show').addClass('hide');
                    o.ft.find('.btn').off('click');
                }
            };
            fun.init();
        },
        /*处理url*/
        url: {
            query: function (key) {
                var value = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"));
                return value ? decodeURIComponent(value[1]) : "";
            }
        }

    };

    MMH.init(); //初始化

    /*重新alert和confirm方法*/
    window.alert = function (args) {
        MMH.tips(args);
    };
    window.confirm = function (args, callback) {
        var params = {};
        Object.prototype.toString.call(args) !== '[object Object]' ? params.body = ('' + args) : params = args;
        callback && (params.confirm = callback);
        MMH.dialog(params)
    };


    window.M = MMH;
})();

//时间对象的格式化 Date.format("yyyy-MM-dd hh:mm:ss");
Date.prototype.format = function (b) {
    var c = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        S: this.getMilliseconds()
    };
    if (/(y+)/.test(b)) {
        b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
    }
    for (var a in c) {
        if (new RegExp("(" + a + ")").test(b)) {
            b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length))
        }
    }
    return b
};