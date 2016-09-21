/*
 * 首页
 * by xqs
 * */
define(function(require, exports, module) {
    var page = {
        config: {
            
        },
        init: function () {




            // 首页顶部banner滚动;
            if($("#js-swiper-home li").length > 1){
                var swiper = new Swiper('#js-swiper-home', {
                    autoplay: 3000,
                    loop: true,
                    pagination: '.swiper-pagination',
                    paginationClickable: true
                });
            }
            //懒加载
            M.lazyLoad.init({
                threshold: 100, // 灵敏度;
                failure_limit: 200, // 容差范围;
                container: $("main.main, .m-home .hang ol")
            });
            page.bindEvents();
            page.setBeans(); // 妈豆尊享;
        },
        bindEvents: function () {
            // dropload 测试
            M.dropLoad({
                callback: function (me) {
                    setTimeout(function () {
                        console.log('end');
                        me.pullToRefreshDone();
                    }, 1000);
                }
            });


            //分页测试
            window.onload = function () {
                $.pagination({
                    scrollBox: '.container',
                    api: '/test/request',
                    container: '.container .floor-list',
                    fnSuccess: function (res, ele) {
                        console.log(JSON.stringify(res))
                        ele.data('locked', true);
                    }
                });
            };
        },
        // 处理妈豆尊享商品 callproces;
        setBeans: function () {
            var beans = $(".js-link-type-5");
            beans.each(function () {
                var thas = $(this), json = thas.data("json"),
                    start = Number(json.buyBeginTime), end = Number(json.buyEndTime),
                    current = Number(json.currentTime), stock = json.stock;
                //console.log(start, end, current);
                if(stock > 0 && start > current){
                    // 未开始;
                    thas.append('<ol class="time"><li class="hour"></li><li class="minute"></li><li class="second"></li></ol>').timeCountDown({
                        startDate: current,
                        endDate: start,
                        callback: function () {
                            thas.append('<span class="start">正在抢购中...</span>');
                            thas.find("ol.time").remove();
                            thas.timeCountDown({
                                startDate: start,
                                endDate: end,
                                callback: function () {
                                    // 已结束
                                    thas.append('<span class="end">抢购已结束</span>').find("span.start").remove();
                                }
                            });
                        }
                    });
                }else if(stock > 0 && start <= current && current <= end){
                    // 进行中;
                    thas.append('<span class="start">正在抢购中...</span>');
                    thas.timeCountDown({
                        startDate: current,
                        endDate: end,
                        callback: function () {
                            // 已结束
                            thas.append('<span class="end">抢购已结束</span>').find("span.start").remove();
                        }
                    });
                }else{
                    // 已结束
                    thas.append('<span class="end">抢购已结束</span>');
                }
            });
        }
    };

    page.init();
});