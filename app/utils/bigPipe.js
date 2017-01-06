/*
 * bigPipe 分块传输方案封装
 * By xqs 2016/7/6
 * @params task [Object] 默认形式为{id: 'A', html: 'test'}
 * Mark：根据具体的业务需求，可扩展或重写fetch和done方法
 * Reference:  [1] https://github.com/undoZen/bigpipe-on-node
 * [2] http://taobaofed.org/blog/2015/12/17/seller-bigpipe/
 * */
var HttpClient = require("../utils/http_client");
var path = require('path');

/*构造函数*/
function bigPipe(task, http, options) {
    var me = this;
    me.task = task;   //任务数组，包含common和module
    me.http = http;   //http请求需要的参数，[req, res, next]
    me.data = []; //所有请求的数据存储在此。以数组的形式返回到页面，可参考积分页面，tab上需要同时显示积分总和。
    me.scripts = [];   //最终返回的script片段数据，动态渲染页面

    var defaults = {
        chunked: false,   //是否分片输出，默认为false。false的情况会同时发送N个请求，一次性返回json template结果；true会分片渲染页面，使用res.write的方式。
        succeed: function () {
            //全部请求完成，可根据具体业务逻辑重写该方法
            var res = this.http[1];
            res.end();
        },
        failed: function (error) {
            //有请求失败
            var res = this.http[1];
            log.error('[bigPipe task error] ', JSON.stringify(error));
            if (this.options.chunked) {
                res.end();
            } else {
                res.json(error)
            }
        }
    };
    me.options = $.extend({}, defaults, options);

    me.render(); //render
}

/*轮询操作*/
bigPipe.prototype.render = function () {
    var me = this, res = me.http[1], task = this.task;

    //例如：

    //task = {
    //    "coupons": {
    //        common: {
    //            api: API.coupons,
    //            pug: '/lists/coupon.pug',
    //            blank: {style: '07', tips: '您暂时还没有优惠劵哦~'}
    //        },
    //        module: [
    //            {
    //                selector: ".list:eq(0)",
    //                data: {
    //                    page: 1,
    //                    pageSize: 20,
    //                    status: 1   //未使用
    //                }
    //            },
    //            {
    //                selector: ".list:eq(1)",
    //                data: {
    //                    page: 1,
    //                    pageSize: 20,
    //                    status: 4   //已过期
    //                }
    //            }
    //        ]
    //    }
    //};

    var script = '<script>function bigPipeRender(selector, context){if(document.querySelector(selector)){document.querySelector(selector).innerHTML=context;}}</script>';
    this.scripts.push(script);   //最终返回的数据
    me.options.chunked && res.write(script);

    var taskNum = task.module.length;
    task.module.forEach(function (item, index) {
        me.fetch(item, index, function (error) {
            taskNum--;   //请求完成，计数器减一
            if (taskNum === 0) {
                me.done(error);
            }
        })
    });

};

//fetch方法,输出script
bigPipe.prototype.fetch = function (item, index, callback) {
    var me = this, res = me.http[1];

    var params = $.extend(true, {}, me.task.common || {}, item || {});  //深度合并

    /*空白页面，提示无数据*/
    var viewPath = path.join(__dirname, '../views');
    var blank_info = params.blank || '';
    var blank = typeof blank_info === 'string' ? blank_info : pug.renderFile(viewPath + '/includes/blank.pug', blank_info);

    var formData = params.data || {}; //http请求参数
    HttpClient.request(me.http, {
        url: params.api,
        data: formData,
        success: function (result) {
            var data = me.reform(result, formData);
            me.data[index] = data;

            var context = (pug.renderFile(viewPath + params.pug, data) || blank).replace(/'/g, "\\'").replace(/\n/g, "\\n");     //内容
            if (context) {
                var script = "<script>bigPipeRender('" + params.selector + "','" + context + "');</script>";
                me.scripts.push(script);
                me.options.chunked && res.write(script);
            }

            callback && callback.call(me);
        },
        error: function (error) {
            var data = me.reform(error, formData);
            me.data[index] = data;

            var context = blank.replace(/'/g, "\\'").replace(/\n/g, "\\n");
            if (context) {
                var script = "<script>bigPipeRender('" + params.selector + "','" + context + "');</script>";
                me.scripts.push(script);
                me.options.chunked && res.write(script);
            }

            callback && callback.call(me, error);
        }
    });
};

/*重组数据接口,可重写*/
bigPipe.prototype.reform = function (data, params) {
    var result = {};
    if ('[object Object]' !== Object.prototype.toString.call(data)) {
        result.$data = data;   //将结果放入$data字段中
    } else {
        //对象类型{}
        result = $.extend({}, data);
        result.$data = $.extend({}, data);   //将结果放入$data字段中
    }
    result.request = params;     //将请求参数回传
    return result;
};

//task done
bigPipe.prototype.done = function (error) {
    var me = this, res = me.http[1];
    /*
     * 全部请求完成，此时error参数为最后一个错误信息
     * 状态码1001是未登录状态，此时返回未登录的json到浏览器response
     * 其他状态如服务器异常等情况均执行success方法，只不过此时显示的是blank页面
     * */
    if (error && /^(-1|1001)$/.test(error.error_code)) {
        return me.options.failed.call(me, error);
    }
    me.options.succeed.call(me);
};

module.exports = bigPipe;

