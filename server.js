/*
 * 应用入口文件
 * */

// global vars
global.express = require('express');
global.AppConfig = require('./app/config');
global.log = require('./app/utils/log');
global.jade = require('jade');

/*依赖模块*/
var path = require('path')
    , fs = require('fs')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , favicon = require('serve-favicon')
    , methodOverride = require('method-override')
    , flash = require('connect-flash')
    , domain = require("domain")
    , session = require('express-session')
    , MemcachedStore = require('connect-memcached')(session);


/*设置nodejs路由对应的文件*/
var routes = require('./app/routes')
    , testRouter = require('./app/routes/test');


var app = express();  //创建express实例

/*读取配置文件*/
process.env.PORT = AppConfig.site.port;
log.use(app);

/**
 * 设置session中间件,必须放在前面才生效
 */
app.use(session({
    store: new MemcachedStore({//session存储方式
        hosts: AppConfig.memcached_session_store.hosts,
        prefix: AppConfig.memcached_session_store.prefix,
        ttl: AppConfig.memcached_session_store.ttl
    }),
    name: AppConfig.session_settings.name,
    proxy: AppConfig.session_settings.proxy,
    secret: AppConfig.session_settings.secret,//用户hash加盐，cookie防篡改
    cookie: AppConfig.cookie_settings.base,//cookie设置
    resave: AppConfig.session_settings.resave,//每次请求后都延长session存活时间，默认为true
    saveUninitialized: AppConfig.session_settings.save_uninitialized//是指无论有没有session cookie，每次请求都设置个session cookie
}));
/**
 * 捕获全局未捕获的error(优先级1)
 */
app.use(function (req, res, next) {
    var reqDomain = domain.create();
    reqDomain.on("error", function (err) {
        console.error("====================异常捕获A-开始====================");
        console.error(err.stack);
        console.error("====================异常捕获A-结束====================");

        if (req.is('json')) {
            res.status(500).json({error_code: 500, msg: '出错啦'});
        } else {
            res.render("error", {title: 500, message: "出错啦"});
        }
    });
    reqDomain.run(next);
});
/**
 * 简单过滤器
 */
app.use(function (req, res, next) {
    console.log("session_id:" + req.sessionID);
    next();
});


app.set('views', path.join(__dirname, './app/views'));
app.set('view engine', 'jade'); // 模板引擎设置
app.use(flash());    //使用session实现的flash
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));  // 设置静态文件
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);  //配置路由
app.use('/test', testRouter);  //配置测试路由

/**
 * 处理404
 */
app.all('*', function (req, res, next) {
    if (req.is('json')) {
        res.status(404).json({error_code: 404, msg: '迷路了'});
    } else {
        res.render("404", {title: "404"});
    }
    next();
});

module.exports = app;
