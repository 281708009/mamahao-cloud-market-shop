/**
 * Created by Administrator on 2016/4/22.
 * 生产环境配置
 */
module.exports = {
    env:'production',
    site:{
        port:3000,
        name:"mamahao-mobile-site",
        api:{
            host : "api.mamhao.cn",
            port: "80",
            root: "/"
        },
        wechat:{
            //domain:"test.darentong.net",//微信回调地址
            app_id:"wx230909e739bb72fd",
            //app_secret:"44daafd58e556faeb3479e53a56d8850"
        },
        channel:{
            id:8,
            name:"妈妈好微商城"
        }
    },
    log:{
        level:"INFO"
    },
    log4js:{
        appenders:[
            {
                type:"console",
                category: "console"
            },
            {
                type:"dateFile",
                filename:"/usr/logs/mms/debug.log",
                alwaysIncludePattern: false,
                pattern: "_yyyy_MM_dd",
                category:"debug_log"
            },
            {
                type:"dateFile",
                filename:"/usr/logs/mms/error.log",
                alwaysIncludePattern: false,
                pattern: "_yyyy_MM_dd",
                category:"error_log"
            }
        ],
        levels:{
            all:'DEBUG',
            console:'DEBUG',
            debug_log:'DEBUG',
            error_log:'ERROR'
        },
        replaceConsole: true,
    },
    cookie_settings:{
        base:{
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge:1000 * 60 * 60 * 24 * 30,
            domain:'.mamahao.com'
        }
    },
    session_settings:{
        name:'session_id',
        key:"mmh_m_s",
        proxy:true,
        secret : "ma9m6ahao4_hmm",
        resave:true,//每次请求重新设置session时间
        save_uninitialized:false    //是否每次请求都设置session
    },
    redis_session_store : {
        host: "localhost",
        port: 6379,
        ttl: 1800
    },
    memcached_session_store : {
        hosts:['172.28.1.129:11211'],
        prefix:"mms_session_",
        ttl:1800
    }
};