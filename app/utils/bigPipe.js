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
function bigPipe(task, http, chunked) {
    this.task = task;   //任务数组，包含common和module
    this.http = http;   //http请求需要的参数，[req, res, next]
    this.data = []; //所有请求的数据存储在此。以数组的形式返回到页面，可参考积分页面，tab上需要同时显示积分总和。
    this.chunked = chunked || false; //是否分片输出，默认为false。false的情况会同时发送N个请求，一次性返回json template结果；true会分片渲染页面，使用res.write的方式。
    this.scripts = [];   //最终返回的script片段数据，动态渲染页面

    this.render(); //render
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

    var script = '<script>function bigPipeRender(selector, context) {$(selector).empty().append(context);}</script>';
    this.scripts.push(script);   //最终返回的数据
    me.chunked && res.write(script);

    var taskNum = task.module.length;
    task.module.map(function (item) {
        me.fetch(item, function (error) {
            taskNum--;   //请求完成，计数器减一
            if (taskNum === 0) {
                me.done(error);
            }
        })
    });

};

//fetch方法,输出script
bigPipe.prototype.fetch = function (item, callback) {
    var me = this, res = me.http[1];

    var params = $.extend(true, {}, me.task.common || {}, item || {});  //深度合并

    /*空白页面，提示无数据*/
    var viewPath = path.join(__dirname, '../views');
    var blank_info = params.blank || '';
    var blank = typeof blank_info === 'string' ? blank_info : pug.renderFile(viewPath + '/includes/blank.pug', blank_info);

    HttpClient.request(me.http, {
        url: params.api,
        data: params.data,
        success: function (result) {
            var data = me.reform(result, params);
            //此处有坑，由于多个请求回来的数据时间顺序不一致，data中的顺序不对
            me.data.push(data);

            var context = (pug.renderFile(viewPath + params.pug, data) || blank).replace(/"/g, '\\"');     //内容
            var script = '<script>bigPipeRender("' + params.selector + '","' + context + '");</script>';
            me.scripts.push(script);

            me.chunked && res.write(script);

            callback && callback.call(me);
        },
        error: function (error) {
            me.data.push({request: params.data});

            var context = blank.replace(/"/g, '\\"');
            var script = '<script>bigPipeRender("' + params.selector + '","' + context + '");</script>';
            me.scripts.push(script);

            me.chunked && res.write(script);

            callback && callback.call(me, error);
        }
    });
};

/*重组数据接口,可重写*/
bigPipe.prototype.reform = function (res, req) {
    res.request = req.data;   //将请求参数回传
    return res;
};

//task done
bigPipe.prototype.done = function (error) {
    /*
     * 全部请求完成，此时error参数为最后一个错误信息
     * 状态码1001是未登录状态，此时返回未登录的json到浏览器response
     * 其他状态如服务器异常等情况均执行success方法，只不过此时显示的是blank页面
     * */
    if (error && /^(-1|1001)$/.test(error.error_code)) {
        return this.failed(error);
    }
    this.succeed();
};
//task succeed
bigPipe.prototype.succeed = function () {
    //根据具体业务逻辑重写该方法
    // end the stream，do sth...
    var res = this.http[1];
    res.end();
};

//task failed
bigPipe.prototype.failed = function (error) {
    // end the stream， to response
    var me = this, res = me.http[1];
    if(me.chunked){
        return res.end();
    }
    res.status(error.status).json(error);
};

module.exports = bigPipe;

