//log4js的输出级别6个: trace, debug, info, warn, error, fatal;
// 如果输出级别是INFO，则不会打印出低于info级别的日志trace,debug，只打印info,warn,error,fatal。

var logger = {};

var log4js = require('log4js');

var fs = require("fs");
var path = require("path");

// 加载配置文件
var logConfig = require("../config/log4js");

// 检查配置文件所需的目录是否存在，不存在时创建
var appenders = logConfig.appenders;
if (appenders) {
    for (var i in appenders) {
        var item = appenders[i], filename = item["filename"] + item['pattern'];
        var dir = path.dirname(filename);
        checkAndCreateDir(dir);
    }
}

// 目录创建完毕，才加载配置，不然会出异常
log4js.configure(logConfig);


var logConsole = log4js.getLogger('console');
var logDebug = log4js.getLogger('debug');
var logInfo = log4js.getLogger('info');
var logWarn = log4js.getLogger('warn');
var logErr = log4js.getLogger('error');


logger.debug = function () {
    var message = Array.prototype.slice.call(arguments).join('');
    console.debug(message);
    logDebug.debug(message);
};

logger.info = function () {
    var message = Array.prototype.slice.call(arguments).join('');
    console.info(message);
    logInfo.info(message);
};

logger.warn = function () {
    var message = Array.prototype.slice.call(arguments).join('');
    console.warn(message);
    logWarn.warn(message);
};

logger.error = function () {
    var message = Array.prototype.slice.call(arguments).join('');
    console.error(message);
    logErr.error(message);
};


logger.use = function (app) {
    //设置请求日志
    app.use(log4js.connectLogger(logConsole, {level: 'debug', format: ':method :url'}));
};


// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir(dir) {
    if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

module.exports = logger;