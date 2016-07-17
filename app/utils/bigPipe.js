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
function bigPipe(task, http) {
    this.task = task;   //任务数组
    this.http = http;   //http请求需要的参数
    this.data = []; //所有请求的数据存储在此

    this.scripts = ['<script>function bigPipeRender(selector, context) {$(selector).empty().append(context);}</script>'];   //最终返回的数据
    this.render();
}

/*轮询操作*/
bigPipe.prototype.render = function () {
    var me = this, task = this.task;

    //例如：
    /*task = [{
        selector: ".list:eq(0)",
        api: API.coupons,
        jade: '/users/components/coupons_list.jade',
        blank: {style: '01', tips: '暂无数据', btn: [{
            class: 'success',link: 'http//:xx.com',text: 'button'
        }]},
        data: {
            page: 1,
            pageSize: 20,
            status: 1   //未使用
        }
    }];*/

    var taskNum = task.length;
    task.map(function (item) {
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
    var me = this;
    var request = {
        url: item.api || me.task[0].api || '',
        data: item.data || me.task[0].data || {},
    };

    /*空白页面，提示无数据*/
    var viewPath = path.join(__dirname, '../views');
    var blank_info = item.blank || me.task[0].blank || '<p class="tc">暂无数据</p>';
    var blank = typeof blank_info === 'string' ? blank_info : jade.renderFile(viewPath + '/includes/blank.jade', blank_info);

    HttpClient.request(me.http, {
        url: request.url,
        data: request.data,
        success: function (result) {
            var data = me.reform(result, request);
            me.data.push(data);

            var context = (jade.renderFile(viewPath + (item.jade || me.task[0].jade), data) || blank).replace(/"/g, '\\"');     //内容

            me.scripts.push('<script>bigPipeRender("' + item.selector + '","' + context + '");</script>');
            callback && callback.call(me);
        },
        error: function (error) {
            me.data.push({request: request.data});

            var context = blank.replace(/"/g, '\\"');
            me.scripts.push('<script>bigPipeRender("' + item.selector + '","' + context + '");</script>');

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

};

//task failed
bigPipe.prototype.failed = function (error) {
    // end the stream， to response
    var res = this.http[1];
    res.status(error.status).json(error);
};

module.exports = bigPipe;

