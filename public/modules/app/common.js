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
                if ('addEventListener' in document && FastClick) {
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
                $loading.fadeIn();
            },
            /*隐藏loading*/
            hideLoading: function () {
                var $loading = $('.loading');
                $loading[0] && $loading.fadeOut();
            },
            /*ajax请求*/
            ajax: function (params) {
                var c = MMH.config;

                /*是否显示loading*/
                c.showLoading = typeof params.showLoading === 'boolean' ? params.showLoading : true;
                c.loadingDelay = typeof params.loadingDelay === 'number' ? params.loadingDelay : 300;

                /*超时显示loading*/
                if (c.isAjax) return false;
                c.isAjax = true;  //正在ajax请求
                var timer = setTimeout(function () {
                    clearTimeout(timer);
                    c.isAjax && c.showLoading && MMH.showLoading();  //200ms之后显示loading遮罩
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
                    require.async('app/location', function (obj) {
                        new obj().getLocation({
                            success: function (res) {
                                var data = {
                                    //lat: res.lat,
                                    //lng: res.lng,
                                    areaId: res.areaId
                                };
                                dtd.resolve(data);
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
                    $.ajax({
                        type: params.type || "POST",
                        url: params.url || "/",
                        headers: $.extend({ajax: true}, data || {}),
                        data: params.data || {},
                        dataType: params.dataType || "json",
                        timeout: 2e4,  //20s
                        success: function (res) {
                            //console.log('success', JSON.stringify(res))
                            c.isAjax = false;
                            if (res.error_code) {
                                var errorMsg = res.msg;
                                if (params.error) {
                                    return params.error.call(this, res);
                                }
                                if (/^(-1|1001)$/.test(res.error_code)) {
                                    //未登录
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
                            console.log('error--->', res)
                            c.isAjax = false;
                            if (params.error) {
                                params.error.call(this, res);
                            } else {
                                var errorMsg = res.msg || res.statusText;
                                console.log('xxx', res)
                                MMH.tips(errorMsg);
                            }
                        },
                        complete: function (res) {
                            //console.log('complete--->', res)
                            MMH.hideLoading();
                            params.complete && params.complete.call(this, res);
                        }
                    });
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
                                {"text": "确定", "class": "success", "onClick": null},
                                {"text": "取消", "class": "", "onClick": null}
                            ]
                        };
                        Object.prototype.toString.call(args) !== '[object Object]' && (args = {body: args + ''});
                        var params = fun.params = $.extend({}, defaults, args || {});
                        o.bd.html(params.body);
                        params.className && o.inner.addClass(params.className);
                        params.title && o.hd.html(params.title);
                        o.ft.empty().append(function () {
                            return $.map(params.buttons, function (item, index) {
                                var btnClass = ['u-btn', item.class].join(' ');
                                return ['<button class="' + btnClass + '">' + item.text + '</button>'];
                            }).join('');
                        });

                        fun.show();
                    },
                    show: function () {
                        var o = fun.elements, params = fun.params;
                        o.mask.add(o.inner).show().addClass('visible');

                        /*bind events*/
                        $.each(o.ft.find('.u-btn'), function (i, el) {
                            $(el).on('click', function (e) {
                                var callback = params.buttons[i].onClick;
                                if (callback && $.isFunction(callback)) {
                                    callback.call(fun, e);
                                } else {
                                    fun.hide();
                                }
                            })
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
            /*nav*/
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
                            $(document).on('scroll touchmove', function () {
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
                                scrollTop = $("body").scrollTop();
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
            /*Swiper*/
            swipe: function (opts) {
                var util = {
                    elements: {},
                    config: {
                        tab: '.ui-swipe-tab',  //tab
                        swipe: '.ui-swipe',  //swipe外容器
                        currClass: 'current'  //当前容器标识
                    },
                    init: function () {
                        var c = util.config, o = util.elements;
                        o.swipe = $(c.swipe);
                        o.tab = $(c.tab);

                        o.swipe.Swipe({
                            continuous: false,
                            callback: function (index, elem) {
                                var tab = $(elem).closest(c.swipe).data('tab') || c.tab;
                                $(tab).find('ul li').eq(index).addClass('active').siblings().removeClass('active');
                                $(elem).addClass(c.currClass).siblings().removeClass(c.currClass);   //添加当前表示
                            }
                        }).data('Swipe');

                        /*绑定点击事件*/
                        o.tab.on('click', 'ul li', function () {
                            var _this = $(this), _index = _this.index();
                            var target = _this.closest(c.tab).data('target') || c.swipe;
                            var Swipe = $(target).data('Swipe');
                            Swipe.slide(_index);
                        });
                    }
                };
                return {
                    init: util.init
                }
            }(),
            /*懒加载插件*/
            lazyLoad: function () {
                var util = {
                    init: function (options) {
                        //懒加载
                        var defaults = {
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
                };
                return {
                    init: util.init
                };
            }(),
            /*处理url*/
            url: function () {

                //Parse url params to JSON
                function getParams(search) {
                    return search ? JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}') : {};
                }

                var util = {
                    /*
                     * Parse url params to JSON
                     * */
                    params: (function () {
                        var search = location.search.substring(1);
                        return getParams(search);
                    })(),
                    /*
                     * Query url params
                     * */
                    query: function (key) {
                        var value = location.search.match(new RegExp("[\?\&]" + key + "=([^\&]*)(\&?)", "i"));
                        return value ? decodeURIComponent(value[1]) : "";
                    }
                };
                return {
                    getParams: getParams,
                    params: util.params,
                    query: util.query
                };
            }(),
            /* 微信 */
            wx: function () {
                var util = {
                    data: {
                        title: "妈妈好",
                        url: "http://m.mamahao.com/",
                        image: "http://s.mamhao.cn/common/images/icon-114.png",
                        desc: "让每一件商品都是安全的!"
                    },
                    /*授权，初始化*/
                    init: function (wx, args) {
                        var me = util;
                        MMH.ajax({
                            data: {url: window.location.href, r: Math.random()},
                            dataType: "jsonp",
                            //url: "http://api.mamhao.cn/V1/basic/weixin/secret.htm",
                            url: "http://api.mamhao.com" + (/mamhao/g.test(location.host) ? "/mamahao-app-api" : "") + "/pay/weixin/config.htm",  //区分是否为测试环境
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
                                        'hideMenuItems',
                                        'showMenuItems',
                                        'hideAllNonBaseMenuItem',
                                        'getLocation',
                                        'getNetworkType'
                                    ]
                                });

                                wx.ready(function () {
                                    console.info('[wechat config is ready]');
                                    util.share(wx, me.data);
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
                    share: function (wx, msg) {
                        var wxData = {
                            title: msg.title,
                            link: msg.url,
                            imgUrl: msg.image,
                            desc: msg.desc,
                            success: function (e) {
                                // 接口调用成功时执行的回调函数;
                                msg.success && msg.success(e);
                            },
                            cancel: function () {
                                // 用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
                                msg.cancel && msg.cancel();
                            }
                        };
                        var wxDataTimeline = {
                            title: msg.title,
                            link: msg.url,
                            imgUrl: msg.image,
                            success: function (e) {
                                // 接口调用成功时执行的回调函数;
                                msg.success && msg.success(e);
                            },
                            cancel: function () {
                                // 用户点击取消时的回调函数，仅部分有用户取消操作的api才会用到
                                msg.cancel && msg.cancel();
                            }
                        };
                        wx.onMenuShareTimeline(wxDataTimeline);
                        wx.onMenuShareAppMessage(wxData);
                        wx.onMenuShareQQ(wxData);
                        wx.onMenuShareWeibo(wxData);
                    }
                };

                return {
                    init: util.init,
                    share: util.share
                }
            }()
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
                    {"text": "确定", "class": "success", "onClick": callback},
                    {"text": "取消", "class": "", "onClick": null}
                ]
            };
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
     *      ele.data('locked', true);
     *  }
     * });
     * ==============================================================================
     * */

    ;
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
                    me.scroll();
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
            scroll: function () {
                var me = this, o = me.opts;
                var $this = me.$ele = me.currContainer();

                //容器不存在或已被锁定
                if (!$this[0] || $this.data('locked')) return false;

                /*滚动到底部*/
                var currScrollBox = o.scrollBox ? $(o.scrollBox) : me.currContainer();
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
                console.log(JSON.stringify(o))

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
        }

    })(window.jQuery);


    /*=================================
     * 数据加减控件
     * 使用方式： $('.u-quantity .number').spinner();
     * by xqs 160817
     *==================================
     * */
    ;
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

                    //绑定事件
                    $this.siblings(options.decrement + ',' + options.increment).on('click', calc);
                }

                //计算逻辑
                function calc() {
                    var $that = $(this), $num = $that.siblings(options.num);

                    if ($that.hasClass(options.disabled)) return false;

                    var count = +$num.text(),
                        maxCount = +$num.data('max'),
                        minCount = +($num.data('min') || options.min);

                    if ($that.is(options.decrement)) --count;
                    else  ++count;

                    if (!isNaN(minCount) && count <= minCount) {
                        $decrement.addClass(options.disabled);
                        count = minCount;
                    } else {
                        $decrement.removeClass(options.disabled);
                    }

                    if (!isNaN(maxCount) && count >= maxCount) {
                        count = maxCount;
                        $increment.addClass(options.disabled);
                    } else {
                        $increment.removeClass(options.disabled);
                    }

                    $num.text(count);

                }
            })
        };

    })(window.jQuery);


});


