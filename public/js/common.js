/*
 * common.js
 * by xqs 160613
 * */
;
(function () {
    /*jquery扩展*/
    $.extend({
        /*节流*/
        throttle: function (fn, delay) {
            var timer = null;
            return function () {
                var context = this, args = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay ? delay : 200);
            };
        }
    });

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
})();


;
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

            $(function () {
                /*初始化回到顶部按钮*/
                MMH.toTop.init();
                /*初始化自动滑动导航条*/
                MMH.nav.init();
            });
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
                    params.className && o.container.find('.ui-dialog').attr('class', 'ui-dialog ' + params.className);
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
        /*下拉刷新，上拉加载数据*/
        dropload: function (args) {
            /*
             *  无数据 me.noData();  //可传参数true或false，默认值true
             *  重置 me.resetload();  //每次数据加载完，必须重置
             *  锁定 lock(); //参数up、down，不传则锁定上一次加载的方向
             *  解锁 unlock();
             * */
            var container = args.container ? $(args.container) : $('.dropload');
            container.dropload({
                scrollArea: args.scrollArea || window,  //滑动区域，默认值绑定元素自身
                threshold: 100, //提前加载距离,默认值为加载区高度2/3
                domUp: {
                    domClass: 'dropload-up',
                    domRefresh: '<div class="dropload-refresh">↓下拉刷新</div>',
                    domUpdate: '<div class="dropload-update">↑释放更新</div>',
                    domLoad: '<div class="dropload-load"><span class="loading"></span>加载中...</div>'
                },
                domDown: {
                    domClass: 'dropload-down',
                    domRefresh: '<div class="dropload-refresh"></div>',
                    domLoad: '<div class="dropload-load"><span class="icon"></span>正在加载更多的数据...</div>',
                    domNoData: '<div class="dropload-noData">数据已全部加载完成!</div>'
                },
                /*下拉刷新*/
                loadUpFn: args.loadUpFn ? function (me) {
                    console.log('loadUpFn');
                    args.loadUpFn.call(this, me);
                } : null,
                /*上拉加载更多*/
                loadDownFn: args.loadDownFn ? function (me) {
                    console.log('loadDownFn');
                    args.loadDownFn.call(this, me);
                } : null
            });
        },
        calc: function () {
            /*
             * 将浮点数去除小数点，返回整数和倍数。如 3.14 >> 314，倍数是 100
             * @param n {number} 浮点数
             * return {object}
             * {num: 314, times: 100}
             * */
            function toInt(n) {
                var n = +n, res = {num: n, times: 1};
                if (n !== (n | 0)) { //判断浮点数，n===parseInt(n)
                    var arr = ('' + n).split('.');
                    var len = arr[1].length; //小数长度
                    res.times = Math.pow(10, len); //需要乘的倍数=>10的指数
                    res.num = Math.round(n * res.times); //四舍五入取整
                }
                return res;
            }

            function operation(a, b, op) {
                var result; //最终计算的值
                var o1 = toInt(a), o2 = toInt(b);

                var n1 = o1.num, t1 = o1.times;
                var n2 = o2.num, t2 = o2.times;

                var max = Math.max(t1, t2);

                switch (op) {
                    case 'add':
                        if (t1 > t2) {
                            result = n1 + n2 * (t1 / t2);
                        } else {
                            result = n2 + n1 * (t2 / t1);
                        }
                        result = result / max;
                        break;
                    case 'subtract':
                        if (t1 > t2) {
                            result = n1 - n2 * (t1 / t2);
                        } else {
                            result = n1 * (t2 / t1) - n2;
                        }
                        result = result / max;
                        break;
                    case 'multiply':
                        result = (n1 * n2) / (t1 * t2);
                        return result;
                        break;
                    case 'divide':
                        result = (n1 / n2) * (t2 / t1);
                        return result;
                        break;

                }
                return result;
            }

            /*加*/
            function add(a, b) {
                return operation(a, b, 'add');
            }

            /*减*/
            function subtract(a, b) {
                return operation(a, b, 'subtract');
            }

            /*乘*/
            function multiply(a, b) {
                return operation(a, b, 'multiply');
            }

            /*除*/
            function divide(a, b) {
                return operation(a, b, 'divide');
            }

            //exports
            return {
                add: add,
                subtract: subtract,
                multiply: multiply,
                divide: divide
            }
        }(),
        /*一些页面组件*/
        toTop: function () {
            /*这种回到顶部按钮组件*/
            var util = {
                tools: {
                    isWebkit: /webkit/gi.test(navigator.userAgent)
                },
                init: function () {
                    var self = util;
                    var win = $(window), _flex = 60;
                    /*回到顶部按钮*/
                    if ($("meta[name=toTop]")[0]) {
                        var toTop = $("<div class='btn-to-top'></div>").appendTo('body');
                        win.scrollTop() <= _flex && toTop.fadeOut();
                        win.on("resize scroll", $.throttle(function () {
                            if (win.scrollTop() > _flex) toTop.fadeIn();
                            else toTop.fadeOut();
                        }));
                        toTop.on("click.top", function (e) {
                            e.stopPropagation();
                            var _target = self.tools.isWebkit ? 'body' : 'html';
                            $(_target).animate({scrollTop: 0}, 400);
                        });
                    }
                }
            };
            return {
                init: util.init
            }
        }(),
        nav: function () {
            /*设置可滑动导航条组件
             * 1.HTML 需要遵循以下结构
             *  nav.nav.auto-scroll
             *   ul.smooth
             *    li.active
             *     a(href='javascript:;') 首页
             * 2.nav.nav.auto-scroll： 外容器添加class标识，不需要自动滚动时去掉auto-scroll
             * 3.ul.smooth: 移动端平滑滚动
             * */
            var util = {
                elements: {},
                config: {
                    fixTopClass: 'affix'
                },
                init: function () {
                    /*点击分类导航*/
                    var c = util.config, o = util.elements;

                    o.body = $('body');
                    o.nav = $('.auto-scroll');
                    o.placeholder_hd = $('.placeholder-hd');

                    if (o.nav[0]) {
                        if (!o.placeholder_hd[0]) {
                            o.placeholder_hd = $('<div class="placeholder-hd"></div>').prependTo(o.body);
                        }
                        c.navTop = o.nav.offset().top; //nav距离顶部的距离
                        c.navHeight = o.nav.outerHeight(true); //nav的高度
                        o.placeholder_hd.css({"height": c.navHeight, "display": "none"});
                        o.nav.on('click', 'ul li', function () {
                            var _this = $(this), _index = o.nav.find('ul li').index(this);
                            _this.addClass('active').siblings('li').removeClass('active');
                            util.setNavCenter(_index); //设置该item居中显示
                        });
                        /*绑定touchmove和scroll事件*/
                        $(window).on('scroll touchmove', function () {
                            util.fixNav();//固定导航
                        });
                    }
                },
                /*固定tab*/
                fixNav: function () {
                    var c = util.config, o = util.elements;
                    if (o.nav[0]) {
                        var nav = o.nav,
                            holder = o.placeholder_hd,
                            scrollTop = $(document).scrollTop();
                        if (scrollTop > c.navTop) {
                            holder.show();
                            nav.addClass(c.fixTopClass);
                        } else {
                            holder.hide();
                            nav.removeClass(c.fixTopClass);
                            c.navTop = o.nav.offset().top; //nav距离顶部的距离
                        }
                    }
                },
                /*设置当前导航类目居中显示*/
                setNavCenter: function (index) {
                    var c = util.config, o = util.elements;
                    var _this = o.nav.find('ul li').eq(index);
                    var minScrollLeft = 0, maxScrollLeft = getWidth(o.nav.find('ul li')) - getWidth(o.nav);
                    var scrollLeft = getWidth(_this.prevAll()) + getWidth(_this) / 2 - getWidth(o.nav) / 2;
                    scrollLeft < minScrollLeft && scrollLeft == minScrollLeft;
                    scrollLeft > maxScrollLeft && scrollLeft == maxScrollLeft;
                    o.nav.find('ul').stop().animate({scrollLeft: scrollLeft}, 200, function () {
                        _this.addClass('active').siblings().removeClass('active');
                    });

                    /*计算所有元素总宽*/
                    function getWidth(eles) {
                        var result = 0;
                        $.each(eles, function () {
                            result += $(this).outerWidth(true);
                        });
                        return result;
                    }
                }
            };
            return {
                init: util.init
            }
        }(),
        url: function () {
            /*处理url*/
            var util = {
                query: function (key) {
                    var value = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"));
                    return value ? decodeURIComponent(value[1]) : "";
                }
            };
            return {
                query: util.query
            };
        }()
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



