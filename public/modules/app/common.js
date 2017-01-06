/*
 * common.js
 * by xqs 160613
 * */

define(function (require, exports, module) {
    /*
     * jquery扩展方法
     * $.fn.
     * */
    (function () {

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
        // CSS3动画结束事件回调;
        $.fn.transitionEnd = function (callback, off) {
            var events = ['webkitTransitionEnd', 'transitionend', 'oTransitionEnd', 'MSTransitionEnd', 'msTransitionEnd'],
                i, dom = this;
            function fireCallBack(e) {
                if (e.target !== this) return;
                callback.call(this, e);
                if(off){
                    for (i = 0; i < events.length; i++) {
                        dom.off(events[i], fireCallBack);
                    }
                }
            }
            if (callback) {
                for (i = 0; i < events.length; i++) {
                    dom.on(events[i], fireCallBack);
                }
            }
            return this;
        };
        // 长按事件;
        $.fn.longPress = function(callback, interval) {
            var timeout, $this = this;
            this.each(function (a, b) {
                var thas = $(b);
                thas.off("touchstart").on("touchstart", function (e) {
                    timeout = setTimeout(function(){
                        e.preventDefault();
                        e.stopPropagation();
                        callback && callback.call(callback, thas);
                    }, interval || 800);
                });
                thas.off("touchend touchmove").on("touchend touchmove", function () {
                    clearTimeout(timeout);
                });
            });
        };
        // 手机触摸事件;
        $.fn.touchwipe = function (settings) {
            var config = {
                min_move_x: 10,
                min_move_y: 10,
                wipeLeft: function () {},
                wipeRight: function () {},
                wipeUp: function () {},
                wipeDown: function () {},
                preventDefaultEvents: true
            };
            if (settings) $.extend(config, settings);
            this.each(function () {
                var startX, startY, isMoving = false, el = $(this);
                function cancelTouch() {
                    this.removeEventListener("touchmove", onTouchMove);
                    startX = null;
                    isMoving = false;
                }
                function onTouchMove(event) {
                    var e = event;
                    if (e.touches && e.touches.length == 1) {
                        e = event.touches[0];
                    }
                    if (config.preventDefaultEvents) {
                        event.preventDefault();
                    }
                    if (isMoving) {
                        var x = e.pageX;
                        var y = e.pageY;
                        var dx = startX - x;
                        var dy = startY - y;
                        if (Math.abs(dx) >= config.min_move_x) {
                            cancelTouch();
                            if (dx > 0) {
                                config.wipeLeft(el);
                            } else {
                                config.wipeRight(el);
                            }
                        } else if (Math.abs(dy) >= config.min_move_y) {
                            cancelTouch();
                            if (dy > 0) {
                                config.wipeDown(el);
                            } else {
                                config.wipeUp(el);
                            }
                        }
                    }
                }
                function onTouchStart(event) {
                    var e = event;
                    if (e.touches && e.touches.length == 1) {
                        e = event.touches[0];
                    }
                    startX = e.pageX;
                    startY = e.pageY;
                    isMoving = true;
                    this.addEventListener("touchmove", onTouchMove, false);
                }
                this.addEventListener("touchstart", onTouchStart, false);
            });
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
                b = b.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var a in c) {
                if (new RegExp("(" + a + ")").test(b)) {
                    b = b.replace(RegExp.$1, RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length));
                }
            }
            return b;
        };

        //数组去重，支持数组内存储的是对象
        Array.prototype.unique = function () {
            var res = [], json = {}, len = this.length;
            for (var i = 0; i < len; i++) {
                var key = this[i];
                if (Object.prototype.toString.call(this[i]) == '[object Object]') {
                    key = JSON.stringify(this[i]);
                }
                if (!json[key]) {
                    res.push(this[i]);
                    json[key] = 1;
                }
            }
            return res;
        };
        Array.prototype.getIndex = function(c){var b=0,a=this.length;for(;b<a;b++){if(this[b]==c){return b;}}return -1;};
        Array.prototype.remove = function(b){var a=this.getIndex(b);return a!==-1?this.splice(a,1):null;};
        Array.prototype.replaceArr = function(c,b){var a=this.getIndex(c);return a!==-1?this.splice(a,1,b):null;};
    })();


    /*
     * 妈妈好项目内部方法封装
     * Object: MMH
     * */
    (function () {
        var MMH = {
            tools: {
                // 判断是否在妈妈好端;
                isMamahao: /mamahao|mamhao/gi.test(navigator.userAgent),
                // 判断是否在微信端;
                isWeixin: /micromessenger/gi.test(navigator.userAgent),
                // 判断是否在支付宝端;
                isAlipay: /alipaydefined|aliapp|alipayclient/gi.test(navigator.userAgent),
                // 判断是否为android设备;
                isAndroid: /android|huawei/gi.test(navigator.userAgent),
                // 判断是否为iOS设备;
                isiPhone: /iphone|ipod|ipad/gi.test(navigator.userAgent),
                // 校验手机号码;
                isMobile: function(v){return !/^1{1,}[3,4,5,7,8]{1}\d{9}$/.test(v)?false:true;},
                // 获取url参数;
                search: function(v){var value = location.search.match(new RegExp("[\?\&]" + v + "=([^\&]*)(\&?)", "i"));return value ? decodeURIComponent(value[1]) : "";},
                Typeof: function (v) {
                    return Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
                }
            },
            config: {
                isShare: false, // 是否自定义过分享;
                isAjax: {}, //正在ajax的api对象
                // api调用域，区分正式环境及测试环境;
                api: /mamahao.com/gi.test(location.host) ? "http://api.mamahao.com/" : "http://api.mamhao.com/mamahao-app-api/",
                isWeixin: /micromessenger/gi.test(navigator.userAgent)
            },
            init: function () {

                $(function () {
                    /*FastClick 解决click事件移动端300ms延迟的问题*/
                    FastClick.attach(document.body);
                    /*初始化回到顶部按钮*/
                    MMH.toTop.init();
                    // 校验定位地址是否发化了变化;
                    require.async('app/location', function (fun) {
                        fun.getLocation();
                    });
                });
                // 全局微信自定义分享一次;
                require.async('weixin', function (wx) {
                    MMH.wx.init(wx, {
                        ready: function () {
                            if(!M.config.isShare) MMH.wx.share(wx);
                        }
                    });
                });
            },
            /*显示loading*/
            showLoading: function () {
                var $loading = $('.loading');
                if (!$loading[0]) {
                    $loading = $('<div class="loading"><span><s></s></span></div>').appendTo(document.body);
                }
                $loading.stop().fadeIn();
            },
            /*隐藏loading*/
            hideLoading: function () {
                var $loading = $('.loading');
                $loading[0] && $loading.stop().fadeOut();
            },
            /*ajax请求*/
            ajax: function (params) {
                var c = MMH.config;

                /*是否显示loading*/
                c.showLoading = typeof params.showLoading === 'boolean' ? params.showLoading : true;
                c.loadingDelay = typeof params.loadingDelay === 'number' ? params.loadingDelay : 10;

                /*超时显示loading*/
                if (c.isAjax[params.url]) return false;
                c.isAjax[params.url] = true;  //正在ajax请求
                var timer = setTimeout(function () {
                    clearTimeout(timer);
                    c.isAjax[params.url] && c.showLoading && MMH.showLoading();  //200ms之后显示loading遮罩
                }, c.loadingDelay);


                //是否需要地理位置
                if (params.location) {
                    $.when(getLocation()).always(doAjax);//Deferred
                } else {
                    doAjax();
                }


                //处理地理位置信息
                function getLocation() {
                    var dtd = $.Deferred();
                    require.async('app/location', function (fun) {
                        fun.getLocation({
                            success: function (res) {
                                dtd.resolve({location: $.param(res)});
                            },
                            fail: function () {
                                dtd.reject();
                            }
                        });
                    });
                    return dtd.promise();
                }

                /*do ajax*/
                function doAjax(data) {
                    var setting = {
                        type: params.type || "POST",
                        url: params.url || "/",
                        headers: $.extend({ajax: true}, data || {}),
                        data: params.data || {},
                        timeout: 2e4,  //20s
                        success: function (res) {
                            console.log('ajax-success-typeof', typeof res);
                            c.isAjax[params.url] = false;
                            if (res.error_code) {
                                var errorMsg = res.msg;
                                if (params.error) {
                                    return params.error.call(this, res);
                                }
                                if (/^(-1|1001)$/.test(res.error_code)) {
                                    //未登录
                                    if(c.isWeixin){
                                        return location.reload();
                                    }
                                    return MMH.tips({
                                        body: "您还未登录，请登录后再试！",
                                        callback: function () {
                                            location.href = '/login?origin=' + location.href;
                                        }
                                    });
                                }
                                return MMH.tips(errorMsg);
                            }
                            params.success && params.success.call(this, res);
                        },
                        error: function (res) {
                            console.log('error--->', res);
                            c.isAjax[params.url] = false;
                            if (params.error) {
                                params.error.call(this, res);
                            } else {
                                var errorMsg = res.msg || res.statusText;
                                (errorMsg != "error") && MMH.tips(errorMsg);
                            }
                        },
                        complete: function (res) {
                            //console.log('complete--->', res)
                            MMH.hideLoading();
                            params.complete && params.complete.call(this, res);
                        }
                    };

                    //额外配置
                    if (null !== params.dataType) {
                        //default: Intelligent Guess (xml, json, script, or html)
                        setting.dataType = params.dataType;
                    }
                    if (null !== params.cache) {
                        //默认: true, dataType为"script"和"jsonp"时默认为false
                        setting.cache = params.cache;
                    }
                    if (null !== params.processData) {
                        //默认: true
                        setting.processData = params.processData;
                    }
                    if (null !== params.contentType) {
                        //default: 'application/x-www-form-urlencoded; charset=UTF-8'
                        setting.contentType = params.contentType;
                    }

                    $.ajax(setting);
                }
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
                            delay: 1500,
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
                        params.class && o.inner.addClass(params.class); // 附加class;  true / false 提示文字上面有对错图标;

                        fun.show();
                        var timer = setTimeout(function () {
                            clearTimeout(timer);
                            fun.hide();
                        }, params.delay);

                    },
                    show: function () {
                        var o = fun.elements;
                        o.mask.add(o.inner).addClass('visible');
                    },
                    hide: function () {
                        var o = fun.elements, params = fun.params;
                        o.mask.removeClass('visible').transitionEnd(function () {
                            o.mask.remove();
                        }, true);
                        o.inner.removeClass('visible').transitionEnd(function () {
                            o.wrapper.remove();
                        }, true);
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

                        var tpl = ['<div class="ui-mask ui-dialog-mask"></div>', '<div class="ui-dialog-wrap">', '<div class="ui-dialog-inner">', '<div class="ui-dialog-hd"></div>', '<div class="ui-dialog-bd"></div>', '<div class="ui-dialog-ft"></div>', '</div></div>'];
                        o.dialog = $(tpl.join('')).appendTo($('.spa')[0] ? $('.spa') : document.body);

                        o.mask = $('.ui-dialog-mask');
                        o.wrapper = $('.ui-dialog-wrap');
                        o.inner = $('.ui-dialog-inner');
                        o.hd = $('.ui-dialog-hd');
                        o.bd = $('.ui-dialog-bd');
                        o.ft = $('.ui-dialog-ft');

                        var defaults = {
                            body: '模态框内容',
                            buttons: [
                                {"text": "取消", "class": "", "onClick": null},
                                {"text": "确定", "class": "success", "onClick": null}
                            ]
                        };
                        Object.prototype.toString.call(args) !== '[object Object]' && (args = {body: args + ''});
                        var params = fun.params = $.extend({}, defaults, args || {});
                        o.bd.html(params.body);
                        params.className && o.wrapper.addClass(params.className);
                        params.title && o.hd.addClass("in").html(params.title);
                        o.ft.empty().append(function () {
                            return $.map(params.buttons, function (item, index) {
                                var btnClass = ['u-btn', item.class].join(' ');
                                return ['<button class="' + btnClass + '">' + item.text + '</button>'];
                            }).join('');
                        });
                        // 点击蒙板隐藏弹出层;
                        params.isMask && o.mask.off("click").on("click", function () {fun.hide();});

                        fun.show();
                    },
                    show: function () {
                        var o = fun.elements, params = fun.params;
                        o.mask.add(o.inner).show().addClass('visible');

                        /*bind events*/
                        o.ft.on('click', '.u-btn', function (e) {
                            var index = $(this).index();
                            var callback = params.buttons[index].onClick;
                            if (callback && $.isFunction(callback)) {
                                callback.call(fun, fun);
                            } else {
                                fun.hide();
                            }
                        });

                    },
                    hide: function () {
                        var o = fun.elements;
                        o.mask.removeClass('visible').transitionEnd(function () {
                            o.mask.remove();
                        }, true);
                        o.inner.removeClass('visible').transitionEnd(function () {
                            o.wrapper.remove();
                        }, true);
                        o.ft.find('.u-btn').off('click');
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
                    })();
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
                    n = +n;
                    var res = {num: n, times: 1};
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
                        case 'divide':
                            result = (n1 / n2) * (t2 / t1);
                            return result;

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
                };
            }(),
            /*一些页面组件*/
            toTop: {
                tools: {
                    isWebkit: /webkit/gi.test(navigator.userAgent)
                },
                init: function () {
                    var me = this;
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
                            var $target = $area || (me.tools.isWebkit ? $('body') : $('html'));
                            $target.animate({scrollTop: 0}, 400);
                        });
                    }
                }
            },
            /*设置可滑动导航条组件
             * 1.HTML 需要遵循以下结构
             *  nav.nav.auto-scroll
             *   ul.smooth
             *    li.active
             *     a(href='javascript:;') 首页
             * 2.nav.nav.auto-scroll： 外容器添加class标识，不需要自动滚动时去掉auto-scroll
             * 3.ul.smooth: 移动端平滑滚动
             * */
            nav: {
                elements: {},
                config: {
                    placeholderHeader: '.placeholder-hd', //顶部固定使用的占位div
                    autoScroll: '.auto-scroll',  //点击可自动滑动居中nav对象
                    autoFix: '.auto-fix', //页面滚动可固定在顶部nav对象
                    fixTopClass: 'affix affix-top' //添加固定class
                },
                init: function (options) {
                    var me = this;
                    /*点击分类导航*/
                    var c = me.config, o = me.elements;
                    c.options = options || {};

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
                            me.setNavCenter(_index); //设置该item居中显示
                        });
                    }

                    if (o.autoFixNav[0]) {
                        var $scrollArea = $(c.options.scrollArea) || o.body;
                        if (!o.placeholder_hd[0]) {
                            o.placeholder_hd = $('<div class="placeholder-hd"></div>').prependTo($scrollArea);
                        }
                        o.placeholder_hd.css({"height": c.navHeight, "display": "none"});

                        /*绑定touchmove和scroll事件*/
                        $scrollArea.on('scroll touchmove', function () {
                            me.fixNav();//固定导航
                        });
                    }
                },
                /*固定tab*/
                fixNav: function () {
                    var me = this;
                    var c = me.config, o = me.elements;
                    var $scrollArea = $(c.options.scrollArea) || o.body;

                    if (o.nav[0]) {
                        var nav = o.nav,
                            holder = o.placeholder_hd,
                            scrollTop = $scrollArea.scrollTop();
                        //alert(scrollTop+'-----'+c.navTop)
                        if (scrollTop > c.navTop) {
                            holder.show();
                            nav.addClass(c.fixTopClass);
                        } else {
                            holder.hide();
                            nav.removeClass(c.fixTopClass);
                            //c.navTop = o.nav.offset().top; //nav距离顶部的距离
                        }
                    }
                },
                /*设置当前导航类目居中显示*/
                setNavCenter: function (index) {
                    var me = this;
                    var c = me.config, o = me.elements;
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
            },
            /*Swiper
             * [config options]
             * startSlide [Integer (default:0)] - 初始切换索引值
             * speed [Integer (default:300)] - 切换速度 ms
             * auto [Integer] - 切换间隔 ms
             * continuous [Boolean (default:true)] - 是否无限切换
             * disableScroll [Boolean (default:false)] - stop any touches on this container from scrolling the page
             * stopPropagation [Boolean (default:false)] - 阻止事件冒泡
             * callback [Function] - runs at slide change.
             * transitionEnd [Function] - runs at the end slide transition.
             *
             * [API]
             * prev() 切换到上一项
             * next() 切换到下一项
             * getPos() 获取当前切换索引值
             * getNumSlides() returns the total amount of slides
             * slide(index, duration) 切换到目标索引项 (duration: 切换速度)
             * */
            swipe: {
                elements: {},
                config: {
                    tab: '.ui-swipe-tab',  //tab
                    swipe: '.ui-swipe',  //swipe外容器
                    currClass: 'current'  //当前容器标识
                },
                init: function (opts) {
                    var me = this;
                    var c = me.config, o = me.elements;
                    o.swipe = $(c.swipe);
                    o.tab = $(c.tab);

                    var defaults = {
                        continuous: false,
                        callback: function (index, elem) {
                            var tab = $(elem).closest(c.swipe).data('tab') || c.tab;
                            $(tab).find('ul li').eq(index).addClass('active').siblings().removeClass('active');
                            $(elem).addClass(c.currClass).siblings().removeClass(c.currClass);   //添加当前表示
                        }
                    };

                    var options = $.extend({}, defaults, opts || {});
                    //加载swipe
                    require.async('swipe', function () {
                        o.swipe.Swipe(options).data('Swipe');
                    });

                    /*绑定点击事件*/
                    o.tab.on('click', 'ul li', function () {
                        var _this = $(this), _index = _this.index();
                        var target = _this.closest(c.tab).data('target') || c.swipe;
                        var Swipe = $(target).data('Swipe');
                        Swipe.slide(_index);
                    });
                }
            },
            /*懒加载插件*/
            lazyLoad: {
                init: function (options) {
                    //懒加载
                    var defaults = {
                        container: $('.spa'),
                        threshold: 200,
                        effect: "fadeIn",
                        load: function (elements_left, settings) {
                            //移出节点上的图片源地址
                            $(this).removeAttr('data-' + settings.data_attribute);
                        }
                    };
                    var params = $.extend({}, defaults, options || {});
                    require.async('lazyload', function () {
                        $('[data-original]').lazyload(params);
                    });
                }
            },
            /*处理url*/
            url: {
                //Parse url params to JSON
                getParams: function getParams(search) {
                    var obj = {};
                    if (search) {
                        var arr = search.split("&"), i = 0, l = arr.length;
                        for (; i < l; i++) {
                            var k = arr[i].split("=");
                            var a = arr[i].match(new RegExp(k[0] + "=([^\&]*)(\&?)", "i"));
                            obj[k[0]] = decodeURIComponent(a[1]);
                        }
                    }
                    return obj;
                    /*var result = search ? JSON.parse('{"' + search.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}') : {};
                     for(var i in result){
                     result[i] = decodeURIComponent(result[i]);
                     }
                     return result;*/
                },
                /*
                 * Parse url params to JSON
                 * */
                params: function () {
                    var me = this;
                    var search = location.search.substring(1);
                    return me.getParams(search);
                },
                /*
                 * Query url params
                 * */
                query: function (key) {
                    var value = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"));
                    return value ? decodeURIComponent(value[1]) : "";
                }
            },
            /* 支付 */
            pay: {
                config: {},
                // 微信受权支付链接跳转;
                order: function (orderNo,dealingType) {
                    location.href = "/pay/?orderNo=" + orderNo + "&dealingType=" + (dealingType || 1);
                    /*if(MMH.config.isWeixin){
                     // 微信appi，区分正式环境及测试环境;
                     var appid = /mamahao.com/gi.test(location.host) ? "wxd62811cd601f0061" : "wx230909e739bb72fd";
                     location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid='+ appid +'&redirect_uri='+ MMH.config.api +'pay/weixin/getOpenId.htm?orderNo=' + orderNo + '&response_type=code&scope=snsapi_base&state=123456#wechat_redirect';
                     }else{
                     location.href = "/pay/?orderNo=" + orderNo;
                     }*/
                },
                // 微信支付;
                weixin: function (options) {
                    var me = this, params = options;
                    options.config && $.extend(options.config, me.config);
                    console.log("M-pay-weixin----->", JSON.stringify(params.data));
                    MMH.ajax({
                        url: '/api/wxPay',
                        data: params.data,
                        success: function (res) {
                            //console.log(WeixinJSBridge);
                            //调起微信支付控件
                            if (typeof(WeixinJSBridge) == "undefined") {
                                if (document.addEventListener) {
                                    document.addEventListener('WeixinJSBridgeReady', function () {
                                        WeixinJSBridge.invoke(
                                            'getBrandWCPayRequest', {
                                                "appId": res.appId,     //公众号名称，由商户传入
                                                "timeStamp": res.timeStamp,         //时间戳，自1970年以来的秒数
                                                "nonceStr": res.nonceStr, //随机串
                                                "package": res.package,
                                                "signType": "MD5",         //微信签名方式：
                                                "paySign": res.paySign //微信签名
                                            },
                                            function (res) {
                                                //alert("1"+res.err_msg);
                                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                                    //alert('支付成功');
                                                    if (typeof params.callback == "string") {
                                                        location.href = params.callback;
                                                    } else {
                                                        params.callback && params.callback.call(this);
                                                    }
                                                }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                            }
                                        );
                                    }, false);
                                } else if (document.attachEvent) {
                                    document.attachEvent('WeixinJSBridgeReady', function () {
                                        WeixinJSBridge.invoke(
                                            'getBrandWCPayRequest', {
                                                "appId": res.appId,     //公众号名称，由商户传入
                                                "timeStamp": res.timeStamp,         //时间戳，自1970年以来的秒数
                                                "nonceStr": res.nonceStr, //随机串
                                                "package": res.package,
                                                "signType": "MD5",         //微信签名方式：
                                                "paySign": res.paySign //微信签名
                                            },
                                            function (res) {
                                                //alert("2"+res.err_msg);
                                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                                    //alert('支付成功');
                                                    if (typeof params.callback == "string") {
                                                        location.href = params.callback;
                                                    } else {
                                                        params.callback && params.callback.call(this);
                                                    }
                                                }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                            }
                                        );
                                    });
                                    document.attachEvent('onWeixinJSBridgeReady', function () {
                                        WeixinJSBridge.invoke(
                                            'getBrandWCPayRequest', {
                                                "appId": res.appId,     //公众号名称，由商户传入
                                                "timeStamp": res.timeStamp,         //时间戳，自1970年以来的秒数
                                                "nonceStr": res.nonceStr, //随机串
                                                "package": res.package,
                                                "signType": "MD5",         //微信签名方式：
                                                "paySign": res.paySign //微信签名
                                            },
                                            function (res) {
                                                //alert("3"+res.err_msg);
                                                if (res.err_msg == "get_brand_wcpay_request:ok") {
                                                    //alert('支付成功');
                                                    if (typeof params.callback == "string") {
                                                        location.href = params.callback;
                                                    } else {
                                                        params.callback && params.callback.call(this);
                                                    }
                                                }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                            }
                                        );
                                    });
                                }
                            } else {
                                WeixinJSBridge.invoke(
                                    'getBrandWCPayRequest', {
                                        "appId": res.appId,     //公众号名称，由商户传入
                                        "timeStamp": res.timeStamp,         //时间戳，自1970年以来的秒数
                                        "nonceStr": res.nonceStr, //随机串
                                        "package": res.package,
                                        "signType": "MD5",         //微信签名方式：
                                        "paySign": res.paySign //微信签名
                                    },
                                    function (res) {
                                        if (res.err_msg == "get_brand_wcpay_request:ok") {
                                            //alert('支付成功');
                                            if (typeof params.callback == "string") {
                                                location.href = params.callback;
                                            } else {
                                                params.callback && params.callback.call(this);
                                            }
                                        }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                    }
                                );
                            }

                        }
                    });
                },
                // 支付宝支付;
                alipay: function (options) {
                    var me = this, params = options;
                    options.config && $.extend(options.config, me.config);
                    console.log("M-pay-alipay----->", JSON.stringify(params.data));
                    MMH.ajax({
                        url: '/api/aliPay',
                        data: params.data,
                        success: function (res) {
                            var $form = $(res.data);
                            if (params.data.resource == 2) {
                                var queryParam = '';
                                $form.find("input").each(function () {
                                    var name = $(this).attr("name");
                                    var value = $(this).attr("value");
                                    //console.log(name+"  "+ value);
                                    queryParam += name + '=' + encodeURIComponent(value) + '&';
                                });
                                var gotoUrl = $form.attr('action') + queryParam;
                                require.async('3rd/ap.js', function () {
                                    _AP.pay(gotoUrl);
                                });
                            } else {
                                // 支付宝支付成功后的跳转是由服务端api控制;
                                $form.submit();
                            }
                        }
                    });
                }
            },
            /* 微信 */
            wx: {
                shareData: {
                    title: $("meta[itemprop=name]").attr("content") || "妈妈好商城",
                    url: window.location.origin,
                    image: $("meta[itemprop=image]").attr("content") || "//img.mamhao.cn/s/common/images/icon-114.png",
                    desc: $("meta[itemprop=description]").attr("content") || "好孩子集团旗下母婴电商平台，让每一件商品都是安全的！"
                },
                /*授权，初始化*/
                init: function (wx, args) {
                    if (!args) args = {};
                    MMH.ajax({
                        data: {url: window.location.href, r: Math.random()},
                        dataType: "jsonp",
                        //url: MMH.config.api + "V1/basic/weixin/secret.htm",
                        url: MMH.config.api + "pay/weixin/config.htm",  //区分是否为测试环境
                        success: function (data) {
                            console.log(data);
                            wx.config({
                                debug: false,
                                appId: data.appId,
                                timestamp: data.time,
                                nonceStr: data.none,
                                signature: data.sign,
                                jsApiList: [
                                    'checkJsApi',
                                    'onMenuShareTimeline',
                                    'onMenuShareAppMessage',
                                    'onMenuShareQQ',
                                    'onMenuShareWeibo',
                                    'onMenuShareQZone',
                                    'hideMenuItems',
                                    'showMenuItems',
                                    'hideAllNonBaseMenuItem',
                                    'showAllNonBaseMenuItem',
                                    'translateVoice',
                                    'startRecord',
                                    'stopRecord',
                                    'onVoiceRecordEnd',
                                    'playVoice',
                                    'onVoicePlayEnd',
                                    'pauseVoice',
                                    'stopVoice',
                                    'uploadVoice',
                                    'downloadVoice',
                                    'chooseImage',
                                    'previewImage',
                                    'uploadImage',
                                    'downloadImage',
                                    'getNetworkType',
                                    'openLocation',
                                    'getLocation',
                                    'hideOptionMenu',
                                    'showOptionMenu',
                                    'closeWindow',
                                    'scanQRCode',
                                    'chooseWXPay',
                                    'openProductSpecificView',
                                    'addCard',
                                    'chooseCard',
                                    'openCard'
                                ]
                            });

                            wx.ready(function () {
                                console.info('[wechat config is ready]');
                                args.ready && args.ready.call(this);
                            });

                            wx.error(function (res) {
                                console.error('[wechat config error]', res.errMsg);
                                args.error && args.error.call(this, res);
                            });

                        }
                    });
                },
                /*分享*/
                share: function (wx, opts) {
                    var me = this, params = $.extend({}, me.shareData, opts || {});
                    //nsole.log("share----------->", params);
                    // 调用过分享方法就设置成true，防止common重复调用;
                    M.config.isShare = true;
                    //先初始化
                    wx.ready(function () {
                        var wxData = {
                            title: params.title,
                            link: encodeURI(params.url),
                            imgUrl: encodeURI(params.image),
                            desc: params.desc,
                            success: function (e) {
                                // 接口调用成功时执行的回调函数;
                                params.success && params.success(e);
                            },
                            cancel: function () {
                                // 用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
                                params.cancel && params.cancel();
                            }
                        };
                        var wxDataTimeline = {
                            title: params.title,
                            link: encodeURI(params.url),
                            imgUrl: encodeURI(params.image),
                            success: function (e) {
                                // 接口调用成功时执行的回调函数;
                                params.success && params.success(e);
                            },
                            cancel: function () {
                                // 用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
                                params.cancel && params.cancel();
                            }
                        };
                        wx.onMenuShareTimeline(wxDataTimeline);
                        wx.onMenuShareAppMessage(wxData);
                        wx.onMenuShareQQ(wxData);
                        wx.onMenuShareWeibo(wxData);
                    });
                }
            },
            // 安卓微信端重写 location.reload();
            reload: function (key) {
                if(M.tools.isWeixin && M.tools.isAndroid){
                    var key = (key || 'wechat_time') +'=', url = location.href;  //默认是"t"
                    var reg = new RegExp(key + '\\d+');  //正则：t=1472286066028
                    var timestamp =+ new Date();
                    if(url.indexOf(key) > -1){ //有时间戳，直接更新
                        url = url.replace(reg, key + timestamp);
                    }else{  //没有时间戳，加上时间戳
                        if(url.indexOf('\?') > -1){
                            var urlArr = url.split('\?');
                            if(urlArr[1]){
                                url = urlArr[0] + '?' + key + timestamp + '&' + urlArr[1];
                            }else{
                                url = urlArr[0] + '?' + key + timestamp;
                            }
                        }else{
                            if(url.indexOf('#') > -1){
                                url = url.split('#')[0] + '?' + key + timestamp + location.hash;
                            }else{
                                url = url + '?' + key + timestamp;
                            }
                        }
                    }
                    // 修改浏览器历史
                    history.replaceState(null, document.title, url);
                    location.reload(true);
                }else{
                    window.location.reload();
                }
            },
            // Base64 encode / decode
            Base64: function (){
                // private property
                _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                // public method for encoding
                this.encode = function (input) {
                    var output = "";
                    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                    var i = 0;
                    if(typeof input !== "string"){
                        if(typeof input === "object"){
                            input = JSON.stringify(input);
                        }else{
                            input = String(input);
                        }
                    }
                    input = _utf8_encode(input);
                    while (i < input.length) {
                        chr1 = input.charCodeAt(i++);
                        chr2 = input.charCodeAt(i++);
                        chr3 = input.charCodeAt(i++);
                        enc1 = chr1 >> 2;
                        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                        enc4 = chr3 & 63;
                        if (isNaN(chr2)) {
                            enc3 = enc4 = 64;
                        } else if (isNaN(chr3)) {
                            enc4 = 64;
                        }
                        output = output +
                            _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                            _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                    }
                    return output;
                };
                // public method for decoding
                this.decode = function (input) {
                    var output = "";
                    var chr1, chr2, chr3;
                    var enc1, enc2, enc3, enc4;
                    var i = 0;
                    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                    while (i < input.length) {
                        enc1 = _keyStr.indexOf(input.charAt(i++));
                        enc2 = _keyStr.indexOf(input.charAt(i++));
                        enc3 = _keyStr.indexOf(input.charAt(i++));
                        enc4 = _keyStr.indexOf(input.charAt(i++));
                        chr1 = (enc1 << 2) | (enc2 >> 4);
                        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                        chr3 = ((enc3 & 3) << 6) | enc4;
                        output = output + String.fromCharCode(chr1);
                        if (enc3 != 64) {
                            output = output + String.fromCharCode(chr2);
                        }
                        if (enc4 != 64) {
                            output = output + String.fromCharCode(chr3);
                        }
                    }
                    output = _utf8_decode(output);
                    return output;
                };
                // private method for UTF-8 encoding
                _utf8_encode = function (string) {
                    string = string.replace(/\r\n/g,"\n");
                    var utftext = "";
                    for (var n = 0; n < string.length; n++) {
                        var c = string.charCodeAt(n);
                        if (c < 128) {
                            utftext += String.fromCharCode(c);
                        } else if((c > 127) && (c < 2048)) {
                            utftext += String.fromCharCode((c >> 6) | 192);
                            utftext += String.fromCharCode((c & 63) | 128);
                        } else {
                            utftext += String.fromCharCode((c >> 12) | 224);
                            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                            utftext += String.fromCharCode((c & 63) | 128);
                        }

                    }
                    return utftext;
                };
                // private method for UTF-8 decoding
                _utf8_decode = function (utftext) {
                    var string = "";
                    var i = 0;
                    var c = c1 = c2 = 0;
                    while ( i < utftext.length ) {
                        c = utftext.charCodeAt(i);
                        if (c < 128) {
                            string += String.fromCharCode(c);
                            i++;
                        } else if((c > 191) && (c < 224)) {
                            c2 = utftext.charCodeAt(i+1);
                            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                            i += 2;
                        } else {
                            c2 = utftext.charCodeAt(i+1);
                            c3 = utftext.charCodeAt(i+2);
                            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                            i += 3;
                        }
                    }
                    return string;
                };
            },
            // 时间、日期处理;
            date: {
                // 两个日期间隔
                diff: function (date1, date2, interval) {
                    var objInterval = {
                            'D': 1000 * 60 * 60 * 24,
                            'H': 1000 * 60 * 60,
                            'M': 1000 * 60,
                            'S': 1000,
                            'T': 1
                        },
                        int = interval || "D",
                        t1 = MMH.tools.Typeof(date1),
                        t2 = MMH.tools.Typeof(date2),
                        dt1 = t1 === 'date' ? date1 : (t1 === 'number' ? new Date(date1) : new Date(date1.replace(/\-/g, '/'))),
                        dt2 = t2 === 'date' ? date2 : (t2 === 'number' ? new Date(date2) : new Date(date2.replace(/\-/g, '/')));
                    return Math.floor((dt2 - dt1) / objInterval[int.toUpperCase()]);
                }
            },
            // 联系客服
            im: {
                config: {
                    //租户id
                    tenantId: '20225',
                    //orgName#appName
                    appKey: 'mamahao#mamahao',
                    //手机App绑定的IM号
                    to: 'chat',
                    //环信移动客服域，固定值，请按照示例配置
                    domain: '//kefu.easemob.com',
                    //自己服务器上im.html文件的路径
                    path: '//'+ location.host +'/im',
                    //访客插件static的路径
                    staticPath: '//'+ location.host +'/im/static',
                    //移动端点击联系客服按钮自动发送订单消息demo
                    extMsg: {
                        type: "custom",
                        msgtype: {}
                    }
                },
                init: function () {
                    var self = this;
                    require.async('/im/easemob.js', function(im) {
                        self.easemobim = im || {};
                        $.extend(self.easemobim.config, self.config);
                    });
                },
                bind: function () {
                    var self = this;
                    self.easemobim.config.extMsg = {};
                    self.easemobim.bind();
                },
                // 图文信息
                track: function (data, user) {
                    var self = this;
                    self.easemobim.config.extMsg.msgtype = {
                        track: $.extend({
                            // 消息标题
                            title: "我正在看：",
                            // 商品价格
                            price: "商品价格",
                            // 商品描述
                            desc: "商品描述",
                            // 商品图片链接
                            img_url: "//img.mamhao.cn/s/common/images/icon-114.png",
                            // 商品页面链接
                            item_url: "http://m.mamahao.com/"
                        }, data)
                    };
                    // 用户信息;
                    user && (self.easemobim.config.visitor = user);
                    //console.log(self.easemobim.config);
                    self.easemobim.bind();
                },
                // 订单信息
                order: function (data, user) {
                    var self = this;
                    self.easemobim.config.extMsg.msgtype = {
                        order: $.extend({
                            // 消息标题
                            title: "我的订单",
                            // 订单标题
                            order_title: "订单号",
                            // 商品价格
                            price: "商品价格",
                            // 商品描述
                            desc: "商品描述",
                            // 商品图片链接
                            img_url: "//img.mamhao.cn/s/common/images/icon-114.png",
                            // 商品页面链接
                            item_url: "http://m.mamahao.com/"
                        }, data)
                    };
                    // 用户信息;
                    user && (self.easemobim.config.visitor = user);
                    self.easemobim.bind();
                }
            }
        };

        MMH.init(); //初始化

        /*重新alert和confirm方法*/
        window.alert = function (args) {
            MMH.tips(args);
        };
        window.confirm = function (text, callback) {
            var params = {
                body: '' + text,
                buttons: [
                    {"text": "取消", "class": "", "onClick": null},
                    {"text": "确定", "class": "success", "onClick": callback}
                ]
            };
            MMH.dialog(params);
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
     *      ele.data('locked', true);
     *  }
     * });
     * ==============================================================================
     * */


    (function ($) {

        'use strict';

        $.page = {
            defaults: {
                "keys": {"page": "page", "count": "pageSize", "index": "index"}, //分页参数关键字
                "scrollBox": null,    //触发分页的滚动容器
                "flex": 40,     // 距离底部距离，加载分页数据
                "api": null,    //api接口，分页数据请求地址
                "container": ".pagination",    //分页列表填充容器
                "current": ".current",    //分页列表填充容器
                "fnLoading": null,   //加载中
                "fnSuccess": null,   //加载成功
                "fnFailed": null    //ajax请求后，回调函数res[请求参数和返回的data]、ele[当前容器]
            },
            init: function (options) {
                var me = this,
                    o = me.opts = $.extend(true, {}, me.defaults, options || {});    //参数

                /*初始化*/
                $(o.container).addClass('pagination');  //添加分页容器标识

                /*触发分页的滚动容器,如果是window，需要主动指定"scrollBox": window*/
                var scrollBox = o.scrollBox ? $(o.scrollBox) : $(o.container);
                scrollBox.on("scroll touchmove", function () {
                    me.scroll($(this));
                });

                me.run(); //运行

            },
            run: function () {
                var me = this, o = me.opts;
                var $this = me.$ele = me.currContainer();

                //容器不存在或已被锁定
                if (!$this[0] || $this.data('locked')) return false;

                //容器内没有列表或不满一屏，初始化一次
                if (!$this.children()[0]) {
                    //主动发起请求
                    var ajax_info = $this.data('params');
                    me.ajax(ajax_info);
                    return false;
                }

            },
            /*滚动触发事件*/
            scroll: function (currScrollBox) {
                var me = this, o = me.opts;
                var $this = me.$ele = me.currContainer();

                //容器不存在或已被锁定
                if (!$this[0] || $this.data('locked')) return false;

                /*滚动到底部*/
                var scrollTop = currScrollBox.scrollTop(),
                    diff = currScrollBox[0].scrollHeight - (currScrollBox.height() + scrollTop);

                if (diff < o.flex) {
                    var ajax_info = $this.data('params') || {};
                    ajax_info[o.keys.page] = ($this.data('page') || 1) + 1;

                    me.ajax(ajax_info);
                }

            },
            /*获取当前分页容器*/
            currContainer: function () {
                var me = this, o = me.opts;
                return $(o.current).find('.pagination')[0] ? $(o.current).find('.pagination') : $(o.container + ':visible:eq(0)');
            },
            /*do ajax*/
            ajax: function (params) {
                var me = this, o = me.opts;
                //console.log(JSON.stringify(o))

                me.$ele.data('locked', true);   //锁定当前请求


                //默认参数
                var defaults = {
                    "ajax": true    //表明是分页ajax请求过来的
                };

                defaults[o.keys.page] = 1;
                defaults[o.keys.count] = params.count || 20;   //默认页数和条数
                defaults[o.keys.index] = me.$ele.children().length;   //索引值

                var ajax_info = $.extend(true, defaults, params || {}, me.opts.params || {});

                console.log('ajax_info--->', ajax_info);

                /*加载中*/
                if (!o.fnLoading) {
                    me.$ele.append('<div class="tc pagination-loading">正在加载中...</div>');
                } else {
                    o.fnLoading.call(this, me.$ele);
                }

                //do ajax
                M.ajax({
                    showLoading: false,
                    location: true,
                    url: ajax_info.url || o.api,
                    data: {data: JSON.stringify(ajax_info)},
                    success: function (res) {
                        var info = {
                            params: ajax_info,
                            data: res
                        };
                        me.$ele.data('page', ajax_info[o.keys.page]); //设置页数
                        me.$ele.data('locked', false);    //解除锁定

                        o.fnSuccess && o.fnSuccess.call(this, info, me.$ele);  //将结果返回
                    },
                    error: function (res) {
                        var info = {
                            params: ajax_info,
                            data: res
                        };
                        me.$ele.data('locked', true);    //锁定

                        if (o.fnFailed) {
                            o.fnFailed.call(this, info, me.$ele);  //将结果返回
                        } else {
                            var errorMsg = res.msg || res.statusText;
                            M.tips(errorMsg);
                        }
                    },
                    complete: function () {
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
        };

    })(window.jQuery);


    /*=================================
     * 数据加减控件
     * 使用方式： $('.u-quantity .number').spinner();
     * by xqs 160817
     *==================================
     * */

    (function ($) {
        $.fn.spinner = function (opts) {
            return this.each(function () {
                var defaults = {
                    value: 1,                       //默认值
                    min: 1,                         //最小值
                    num: '.number',                //数字对象
                    decrement: '.decrement',     //减按钮对象
                    increment: '.increment',     //加按钮对象
                    disabled: 'disabled',       //禁用按钮class
                };
                var options = $.extend({}, defaults, opts || {});

                var $this = $(this),
                    $decrement = $(this).siblings(options.decrement),
                    $increment = $(this).siblings(options.increment);

                //初始化
                calcInit();

                //初始化计数器
                function calcInit() {
                    //赋值
                    !$this.text() && $this.text(options.value);
                    var count = +$this.text(),
                        maxCount = $this.data('max'),
                        minCount = $this.data('min') || options.min;
                    if (minCount && count <= minCount) {
                        $decrement.addClass(options.disabled);
                        count = minCount;
                    } else {
                        $decrement.removeClass(options.disabled);
                    }

                    if (maxCount && count >= maxCount) {
                        count = maxCount;
                        $increment.addClass(options.disabled);
                    } else {
                        $increment.removeClass(options.disabled);
                    }
                    $this.text(count);

                    //绑定事件
                    $this.siblings(options.decrement + ',' + options.increment).off().on('click', calc);
                }

                //计算逻辑
                function calc() {
                    var $that = $(this), $num = $that.siblings(options.num);

                    if ($that.hasClass(options.disabled)) return false;

                    var count = +$num.text(),
                        maxCount = $num.data('max'),
                        minCount = $num.data('min') || options.min;

                    if ($that.is(options.decrement)) --count;
                    else  ++count;

                    if (minCount && count <= minCount) {
                        $decrement.addClass(options.disabled);
                        count = minCount;
                    } else {
                        $decrement.removeClass(options.disabled);
                    }

                    if (maxCount && count >= maxCount) {
                        count = maxCount;
                        $increment.addClass(options.disabled);
                    } else {
                        $increment.removeClass(options.disabled);
                    }

                    $num.text(count);

                }
            });
        };

    })(window.jQuery);

    /* ===========================================
     * 倒计时插件 - 设置时间与本机时间进行倒计时;
     * 示例：$(element).timeCountDown({second: 60, endDate:'', startDate: "", elements:{}, callback: function(){}});
     * ===========================================*/
    (function ($) {
        $.fn.timeCountDown = function (params) {
            var me = $(this);
            // console.log(me);
            var defaults = {
                endDate: '2088/08/08 08:08:08', // 结束时间;
                startDate: false,           // 开始时间;
                callback: false,			// 结束回调;
                callstart: false,			// 开始回调;
                callproces: false,			// 进行中回调;
                second: 0,                  // 时间差秒数;
                elements: {
                    second: me.find(".second"),
                    minute: me.find(".minute"),
                    hour: me.find(".hour"),
                    day: me.find(".day")
                },
                pms: {
                    second: "00",
                    minute: "00",
                    hour: "00",
                    day: "00"
                },
                timeout: false
            };
            var options = $.extend({}, defaults, params || {});
            return this.each(function () {
                var fun = {
                    zero: function (n) {
                        return n < 10 ? '0' + n : '' + n;
                    },
                    dv: function () {
                        //ar future = new Date(options.date), now = new Date();
                        //现在将来秒差值
                        //ar dur = Math.round((future.getTime() - now.getTime()) / 1000),
                        var dur = options.second, pms = options.pms;
                        if (dur > 0) {
                            pms.day = fun.zero(Math.floor(dur / (60 * 60 * 24))); //天
                            pms.hour = fun.zero(Math.floor(dur / (60 * 60)) - (pms.day * 24)); //小时
                            pms.minute = fun.zero(Math.floor(dur / 60) - (pms.day * 24 * 60) - (pms.hour * 60)); //分钟
                            pms.second = fun.zero(Math.floor(dur) - (pms.day * 24 * 60 * 60) - (pms.hour * 60 * 60) - (pms.minute * 60)); //秒
                        }
                        return pms;
                    },
                    ui: function () {
                        if(options.stop){
                            options.timeout && clearInterval(options.timeout);
                            return;
                        }
                        $.each(options.elements, function (o, v) {
                            v[0] && v.html(fun.dv()[o] || "00");
                        });
                        options.timeout && clearInterval(options.timeout);
                        // 进行中的回调;
                        $.isFunction(options.callproces) && options.callproces.call(options.callproces, options);
                        // 倒计时完回调;
                        if (options.second <= 0) {
                            $.isFunction(options.callback) && options.callback.call(options.callback, options);
                            return;
                        }
                        options.second--;
                        options.timeout = setTimeout(fun.ui, 1000);
                    }
                };
                if (options.second) {
                    // 如果已经传了时间差，那么直接进行倒计时;
                    fun.ui();
                } else {
                    // 为传时间差，计算传的时间与当前时间的时间差进行倒计时;
                    var future = new Date(options.endDate), now = options.startDate ? new Date(options.startDate) : new Date();
                    options.second = Math.round((future.getTime() - now.getTime()) / 1000);
                    $.isFunction(options.callstart) && options.callstart.call(options.callstart, options);
                    fun.ui();
                }
            });
        };
    })(window.jQuery);
    /* ===========================================
     * 倒计时插件 - 秒数倒计时;
     * 示例：$(element).timing({second: 90, endcall :function(){}, startcall: function(){}, startcall: procescall(){}});
     * ===========================================*/
    (function ($) {
        var Timing = function (element, options) {
            this.config = {
                second: 89,
                endcall: false,				// 结束回调;
                startcall: false,			// 开始回调;
                procescall: false			// 进行中回调;
            };
            if (typeof options == "object") {
                $.extend(this.config, options);
            } else if (typeof options == "number") {
                this.config.second = options;
            }
            this.elems = element;
        };
        Timing.prototype = {
            start: function () {
                var self = this, c = self.config;
                $.isFunction(c.startcall) && c.startcall.call(c.startcall, self);
                self.process();
                c.obj = setInterval(function () {
                    c.second--;
                    if (c.second < 0) return self.end();
                    self.process();
                }, 1000);
            },
            process: function () {
                var self = this, c = self.config;
                self.elems.html(c.second);
                $.isFunction(c.procescall) && c.procescall.call(c.procescall, self);
            },
            end: function () {
                var self = this, c = self.config;
                clearInterval(c.obj);
                $.isFunction(c.endcall) && c.endcall.call(c.endcall, self);
            }
        };
        $.fn.secondCountDown = function (op) {
            return this.each(function () {
                var data = new Timing($(this), op);
                data.start();
            });
        };
    })(window.jQuery);

});


