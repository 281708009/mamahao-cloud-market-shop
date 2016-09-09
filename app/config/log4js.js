var logDir = AppConfig.log.dir;
var config = {
    "appenders": [
        {
            "type": "console",
            "category": "console"
        },
        {
            "type": "dateFile",
            "filename": logDir + "debug/debug.log",
            "pattern": "_yyyy_MM_dd",
            "category": "debug",
            "alwaysIncludePattern": false
        },
        {
            "type": "dateFile",
            "filename": logDir + "info/info.log",
            "pattern": "_yyyy_MM_dd",
            "category": "info",
            "alwaysIncludePattern": false
        },
        {
            "type": "dateFile",
            "filename": logDir + "warn/warn.log",
            "pattern": "_yyyy_MM_dd",
            "category": "warn",
            "alwaysIncludePattern": false
        },
        {
            "type": "dateFile",
            "filename": logDir + "error/error.log",
            "pattern": "_yyyy_MM_dd",
            "category": "error",
            "alwaysIncludePattern": false
        }
    ],
    "replaceConsole": true,
    "levels": {
        "debug": "DEBUG",
        "info": "DEBUG",
        "warn": "DEBUG",
        "error": "DEBUG"
    }
};

module.exports = config;
