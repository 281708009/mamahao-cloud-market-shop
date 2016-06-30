/**
 * Created by Administrator on 2016/4/22.
 * 开发环境配置
 */
module.exports = {
    env:'development',
    site:{
        port:3000,
        name:"mamahao-mobile-site",
        api:{
            host : "172.28.1.107",
            // host : "localhost",
            port: "8080",
            root: "/mamahao-app-api"
        },
        wechat:{
            domain:"test.darentong.net",//微信回调地址
            app_id:"wx54e8641b0560a8b1",
            app_secret:"44daafd58e556faeb3479e53a56d8850"
        },
        channel:{
            id:8,//渠道，写死
            name:"妈妈好微商城"
        }
    },
    log:{
        level:"INFO"
    },
    log4js:{
        appenders:[
            {
                type:"console"
            }
        ],
        replaceConsole: true
    },
    cookie_settings:{
        base:{
            path: '/',
            httpOnly: true,
            secure: false,
            maxAge:1000 * 60 * 60 * 24 * 30,
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