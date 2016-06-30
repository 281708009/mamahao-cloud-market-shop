var log4js = require('log4js');
log4js.configure(AppConfig.log4js);
var console = log4js.getLogger('console');
exports.use = function (app) {
    //设置请求日志
    app.use(log4js.connectLogger(console, {level:'debug', format:':method :url'}));
}

var logger = console;
if(process.env.NODE_ENV == 'production'){
    logger = log4js.getDefaultLogger();

    var debugLogger = log4js.getLogger('debug_log');
    var errorLogger = log4js.getLogger('error_log');

    logger.debug = function (msg) {
        console.debug(msg);
        debugLogger.debug(msg);
    }

    logger.info = function (msg) {
        console.info(msg);
        debugLogger.info(msg);
    }

    logger.warn = function (msg) {
        console.warn(msg);
        debugLogger.warn(msg);
    }

    logger.error = function (msg, ex) {
        if(ex){
            msg += '\r\n' + ex;
        }
        console.error(msg);
        errorLogger.error(msg);
    }
}

exports.logger = logger;