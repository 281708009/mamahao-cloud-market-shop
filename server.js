/*
 * 应用入口文件
 * */

// global vars
global.express = require('express');
global.AppConfig = require('./app/config');
global.log = require('./app/utils/log');
global.$ = require('./app/utils/jquery');
global.pug = require('pug');

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
    , topicRouter = require('./app/routes/topic')
    , toolsRouter = require('./app/routes/tools')
    , testRouter = require('./app/routes/test');


var app = express();  //创建express实例

/*读取配置文件*/
process.env.PORT = AppConfig.site.port;
log.use(app);

/**
 * 设置session中间件,必须放在前面才生效
 */
app.use(session({
    store: new MemcachedStore({//session存储方式，默认存放在内存中，也可以使用 redis，mongodb 等。
        hosts: AppConfig.memcached_session_store.hosts,
        prefix: AppConfig.memcached_session_store.prefix,
        ttl: AppConfig.memcached_session_store.timeout,
        retries: AppConfig.memcached_session_store.retires,
        poolSize: AppConfig.memcached_session_store.poolSize
    }),
    name: AppConfig.session_settings.name,   //设置 cookie 中，保存 session 的字段名称，默认为 connect.sid
    proxy: AppConfig.session_settings.proxy,
    secret: AppConfig.session_settings.secret,//通过设置的 secret 字符串，来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改。
    cookie: AppConfig.cookie_settings.base,//设置存放 session id 的 cookie 的相关选项，默认为(default: { path: '/', httpOnly: true, secure: false, maxAge: null })
    resave: AppConfig.session_settings.resave,//即使 session 没有被修改，也保存 session 值，默认为 true。
    saveUninitialized: AppConfig.session_settings.save_uninitialized, //是指无论有没有session cookie，每次请求都设置个session cookie
    rolling: AppConfig.session_settings.rolling //每个请求都重新设置一个 cookie，默认为 false。
}));
/**
 * 捕获全局未捕获的error(优先级1)
 */
app.use(function (req, res, next) {
    var reqDomain = domain.create();
    reqDomain.on("error", function (err) {
        log.error("====================异常捕获A-开始====================");
        log.error(err.stack);
        log.error("====================异常捕获A-结束====================");

        if (req.is('json')) {
            res.status(500).json({error_code: 500, msg: '出错啦'});
        } else {
            res.render("error", {title: 500, message: "出错啦"});
        }
    });
    reqDomain.run(next);
});


app.set('views', path.join(__dirname, './app/views'));
app.set('view engine', 'pug'); // 模板引擎设置
app.use(flash());    //使用session实现的flash
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(cookieParser());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));  // 设置静态文件
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);  // 商城主业务 配置路由
app.use('/', topicRouter);  // 商城运营活动 配置路由
app.use('/tools', toolsRouter);  // 小工具路由
app.use('/test', testRouter);  // 配置测试路由

/**
 * 处理404
 */
app.use(function (req, res, next) {
    if (req.is('json')) {
        res.status(404).json({error_code: 404, msg: '迷路了'});
    } else {
        res.render("404", {title: "404"});
    }
    next();
});

module.exports = app;
