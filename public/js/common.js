/*
 * common.js
 * by xqs 160613
 * */
;

/*
 * jquery扩展方法
 * $.fn.
 * */
(function () {
    "use strict";

    /*节流*/
    $.throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, typeof delay !== 'number' ? delay : 200);
        };
    };

    /*监听动画结束事件*/
    $.fn.transitionEnd = function (callback) {
        var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
            i, dom = this;

        function fireCallBack(e) {
            if (e.target !== this) return;
            callback.call(this, e);
            for (i = 0; i < events.length; i++) {
                dom.off(events[i], fireCallBack);
            }
        }

        if (callback) {
            for (i = 0; i < events.length; i++) {
                dom.on(events[i], fireCallBack);
            }
        }
        return this;
    };


})();


/*
 * 其他常用方法封装
 * Date等
 * */
(function () {
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
/*
 * 妈妈好项目内部方法封装
 * Object: MMH
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

            $(function () {
                /*初始化回到顶部按钮*/
                MMH.toTop.init();
                /*初始化自动滑动导航条*/
                MMH.nav.init();
            });
        },
        /*显示loading*/
        showLoading: function () {
            var $loading = $('.loading');
            if (!$loading[0]) {
                $loading = $('<div class="loading"><span><s></s></span></div>').appendTo(document.body);
            }
            $loading.show();
        },
        /*隐藏loading*/
        hideLoading: function () {
            var $loading = $('.loading');
            $loading[0] && $loading.hide();
        },
        /*ajax请求*/
        ajax: function (params) {
            var c = MMH.config;

            /*是否显示loading*/
            c.showLoading = typeof params.showLoading === 'boolean' ? params.showLoading : true;

            /*超时显示loading*/
            if (c.isAjax) return false;
            c.isAjax = true;  //正在ajax请求
            var timer = setTimeout(function () {
                clearTimeout(timer);
                c.isAjax && c.showLoading && MMH.showLoading();  //200ms之后显示loading遮罩
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
                    console.log('error--->', res)
                    if (params.error) {
                        params.error.call(this, res);
                    } else {
                        var errorMsg = res.msg || res.statusText;
                        MMH.tips(errorMsg);
                    }
                },
                complete: function (res) {
                    console.log('complete--->', res)
                    c.isAjax = false;
                    MMH.hideLoading();
                    params.complete && params.complete.call(this, res);
                }
            });
        },
        /*tips提示框*/
        tips: function (args) {
            var fun = {
                elements: {},
                init: function () {
                    var o = fun.elements;

                    var tpl = ['<div class="ui-mask ui-mask-transparent ui-tips-mask"></div>', '<div class="ui-tips-wrap">', '<div class="ui-tips">', '<div class="ui-tips-bd"></div></div></div>'];
                    $(document.body).append(tpl.join(''));

                    o.mask = $('.ui-tips-mask');
                    o.wrapper = $('.ui-tips-wrap');
                    o.inner = $('.ui-tips');
                    o.bd = $('.ui-tips-bd');

                    var defaults = {
                        delay: 2000,
                        callback: null  //消失后的回调函数
                    };
                    if (Object.prototype.toString.call(args) !== '[object Object]') {
                        defaults.body = '' + args;
                        fun.params = defaults;
                    } else {
                        fun.params = $.extend({}, defaults, args || {});
                    }
                    var params = fun.params;
                    params.body && o.bd.html(params.body);

                    fun.show();
                    var timer = setTimeout(function () {
                        clearTimeout(timer);
                        fun.hide();
                    }, params.delay || 2000);

                },
                show: function () {
                    var o = fun.elements;
                    o.mask.add(o.inner).addClass('visible');
                },
                hide: function () {
                    var o = fun.elements, params = fun.params;
                    o.mask.removeClass('visible').transitionEnd(function () {
                        o.mask.remove();
                    });
                    o.inner.removeClass('visible').transitionEnd(function () {
                        o.wrapper.remove();
                    });
                    params.callback && params.callback.call(this);
                }
            };
            fun.init();
        },
        /*dialog对话框
         * 父级元素如果有transform属性，会导致子元素的fixed失效。
         * 故：移动端设计时避免使用fixed，或者二者不放在父子容器中。
         * */
        dialog: function (args) {
            var fun = {
                elements: {},
                init: function () {
                    var o = fun.elements;

                    var tpl = ['<div class="ui-mask ui-dialog-mask"></div>', '<div class="ui-dialog-wrap">', '<div class="ui-dialog">', '<div class="ui-dialog-hd"></div>', '<div class="ui-dialog-bd"></div>', '<div class="ui-dialog-ft"></div>', '</div></div>'];
                    $(document.body).append(tpl.join(''));

                    o.mask = $('.ui-dialog-mask');
                    o.wrapper = $('.ui-dialog-wrap');
                    o.inner = $('.ui-dialog');
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
                    params.className && o.wrapper.find('.ui-dialog').attr('class', 'ui-dialog ' + params.className);
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
                    o.mask.add(o.inner).show().addClass('visible');

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
                    o.mask.removeClass('visible').transitionEnd(function () {
                        o.mask.remove();
                    });
                    o.inner.removeClass('visible').transitionEnd(function () {
                        o.wrapper.remove();
                    });
                    o.ft.find('.btn').off('click');
                }
            };
            fun.init();
        },
        /*下拉刷新，上拉加载数据*/
        dropLoad: function (args) {
            var $target = $('.dropload');
            $target[0] && $target.pullToRefresh().on("pull-to-refresh", function () {
                args.callback ? args.callback.call(this, $target) : (function () {
                    var timer = setTimeout(function () {
                        clearTimeout(timer);
                        $target.pullToRefreshDone();
                    }, 500);
                })()
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
            var fun = {
                tools: {
                    isWebkit: /webkit/gi.test(navigator.userAgent)
                },
                init: function () {
                    /*回到顶部按钮*/
                    var $meta = $("meta[name=toTop]");
                    if ($meta[0]) {
                        var $area = $($meta.attr('content') || window), _flex = 60;
                        var $toTop = $("<div class='btn-to-top'></div>").appendTo(document.body);
                        $area.scrollTop() <= _flex && $toTop.fadeOut();
                        $(window).on("resize", $.throttle(function () {
                            if ($area.scrollTop() > _flex) $toTop.fadeIn();
                            else $toTop.fadeOut();
                        }));
                        $area.on("scroll touchmove", $.throttle(function () {
                            if ($area.scrollTop() > _flex) $toTop.fadeIn();
                            else $toTop.fadeOut();
                        }));

                        $toTop.on("click.top", function (e) {
                            e.stopPropagation();
                            var $target = $area || (fun.tools.isWebkit ? $('body') : $('html'));
                            $target.animate({scrollTop: 0}, 400);
                        });
                    }
                }
            };
            return {
                init: fun.init
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
                    placeholderHeader: '.placeholder-hd', //顶部固定使用的占位div
                    autoScroll: '.auto-scroll',  //点击可自动滑动居中nav对象
                    autoFix: '.auto-fix', //页面滚动可固定在顶部nav对象
                    fixTopClass: 'affix affix-top' //添加固定class
                },
                init: function () {
                    /*点击分类导航*/
                    var c = util.config, o = util.elements;

                    o.body = $('body');
                    o.nav = $(c.autoScroll);
                    o.autoFixNav = $(c.autoFix);
                    o.placeholder_hd = $(c.placeholderHeader);

                    if (o.nav[0]) {
                        c.navTop = o.nav.offset().top; //nav距离顶部的距离
                        c.navHeight = o.nav.outerHeight(true); //nav的高度
                        o.nav.on('click', 'ul li', function () {
                            var _this = $(this), _index = o.nav.find('ul li').index(this);
                            _this.addClass('active').siblings('li').removeClass('active');
                            util.setNavCenter(_index); //设置该item居中显示
                        });
                    }

                    if (o.autoFixNav[0]) {
                        if (!o.placeholder_hd[0]) {
                            o.placeholder_hd = $('<div class="placeholder-hd"></div>').prependTo(o.body);
                        }
                        o.placeholder_hd.css({"height": c.navHeight, "display": "none"});

                        /*绑定touchmove和scroll事件*/
                        $("#nav").on('scroll touchmove', function () {
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
                            scrollTop = $("#nav").scrollTop();
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


/* ==============================================================================
 * mobile pagination.js v1.0
 * Description: 上拉到底部ajax请求分页数据
 * Params: @container 请求完数据后，列表容器  @api api接口，分页数据请求地址
 * Ps: 依赖common.js中的ajax方法,请求完成判断为无数据或最后一页，可在ele上data-locked:true,减少ajax请求
 * Author: xqs 2016/06/24
 *
 * * 使用示例
 * $.pagination({
 *  scrollBox: '.container',
 *  api: '/beans',
 *  container: '.container .floor-list',
 *  fnLoaded: function (res, ele) {
 *      console.log(JSON.stringify(res))
 *  }
 * });
 * ==============================================================================
 * */

;
(function ($) {

    'use strict';

    $.page = {
        defaults: {
            "scrollBox": window,    //触发分页的滚动容器
            "flex": 40,     // 距离底部距离，加载分页数据
            "api": null,    //api接口，分页数据请求地址
            "container": ".pagination",    //分页列表填充容器
            "fnLoading": null,   //加载中
            "fnLoaded": null    //ajax请求后，回调函数res[请求参数和返回的data]、ele[当前容器]
        },
        init: function (options) {
            var me = this,
                o = me.opts = $.extend({}, me.defaults, options || {});    //参数

            o.scrollBox = $(o.scrollBox); //转为jquery对象

            $(o.container).addClass('pagination');  //添加分页容器标识

            /*初始化*/
            $(o.scrollBox).on("scroll touchmove", function () {
                me.scroll();
            });

            me.run(); //运行

        },
        run: function () {
            var me = this, o = me.opts;
            var $this = me.$ele = $(o.container + ':visible');

            //容器不存在或已被锁定
            if (!$this[0] || $this.data('locked')) return false;

            //容器内没有列表或不满一屏，初始化一次
            if (!$this.children()[0] || !me.isFullScreen()) {
                //主动发起请求
                var ajax_info = $this.data('params');
                me.ajax(ajax_info);
                return false;
            }

        },
        /*滚动触发事件*/
        scroll: function () {
            var me = this, o = me.opts;
            var $this = me.$ele = $(o.container + ':visible');

            //容器不存在或已被锁定
            if (!$this[0] || $this.data('locked')) return false;

            /*滚动到底部*/
            var scrollTop = o.scrollBox.scrollTop(),
                diff = getHeight(o.scrollBox.children()) - (o.scrollBox.height() + scrollTop);
            if (diff < o.flex) {
                var ajax_info = $this.data('params') || {};
                ajax_info.page = ($this.data('page') || 1) + 1;

                console.log('ajax_info--->', ajax_info)
                me.ajax(ajax_info);
            }


            /*计算所有元素总宽*/
            function getHeight(eles) {
                var result = 0;
                $.each(eles, function () {
                    result += $(this).outerHeight(true);
                });
                return result;
            }

        },
        /*判断是否满一屏决定是否需要加载下一页*/
        isFullScreen: function () {
            var me = this, o = me.opts;
            var full_screen = true;
            if ($(o.container).height() < $(window).height()) {
                full_screen = false;
            }
            console.log('is_full_screen--->', full_screen);
            return full_screen;
        },
        /*do ajax*/
        ajax: function (params) {
            var me = this, o = me.opts;

            me.$ele.data('locked', true);   //锁定当前请求

            /*加载中*/
            if (!o.fnLoading) {
                me.$ele.append('<div class="tc pagination-loading">正在加载中...</div>');
            } else {
                o.fnLoading();
            }

            var defaults = {
                "page": 1,
                "count": o.count || 20,   //默认页数和条数
                "index": me.$ele.children().length   //索引值
            };
            var ajax_info = $.extend({}, defaults, params || {});

            //do ajax
            M.ajax({
                showLoading: false,
                url: ajax_info.url || o.api,
                data: ajax_info,
                success: function (res) {
                    var info = {
                        params: ajax_info,
                        data: res
                    };
                    me.$ele.data('page', ajax_info.page); //设置页数

                    o.callback && o.callback.call(this, info, me.$ele);  //将结果返回
                },
                complete: function () {
                    me.$ele.data('locked', false);    //解除锁定
                    $('.pagination-loading').remove(); //移除loading
                }
            });


        }

    };

    /*
     * === 分页ajax加载插件 ===
     * */
    $.pagination = function (options) {
        $.page.init(options);  //初始化
    }

})(window.jQuery);


