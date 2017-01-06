/**
 * 登录认证中间件
 * 微信授权后openid不存在cookie中，因为之前版本使用的是存加密后的openid到本地，更新逻辑后会出现问题。
 */

var HttpClient = require("../utils/http_client"),
    API = require('../config/api'),
    crypto = require('../utils/crypto');

//微信相关配置
var config = AppConfig.site.wechat,
    app_id = config.app_id,
    app_secret = config.app_secret;

// 微信授权和回调,引入OAuth并实例化
var wxOAuth = require('wechat-oauth'),
    client = new wxOAuth(app_id, app_secret);

var OAuth = {
    /*跳转到登录页面*/
    login: function (req, res, next) {
        var originalUrl = encodeURIComponent(req.protocol + '://' + req.get('host') + req.originalUrl);
        var userAgent = req.header("user-agent"),
            isWeChat = /micromessenger/gi.test(userAgent),
            isMamahao = /mamhao|mamahao/gi.test(userAgent);

        var user_session = req.session.user;

        if (user_session && user_session.memberId) {
            next();
        } else {
            if (isWeChat) {
                // 是微信浏览器
                res.redirect('/account/bind?origin=' + originalUrl);
            } else if (isMamahao) {
                // 是妈妈好内部;
                res.redirect('/login/mamahao?origin=' + originalUrl);
            } else {
                req.session.error = 'Access denied!';
                res.redirect('/login?origin=' + originalUrl);
            }
        }
    },
    /*
     * 微信静默授权
     * 只获取openid
     * */
    wechatBase: function (req, res, next) {
        var domain = req.protocol + '://' + req.get('host'),
            originalUrl = domain + req.originalUrl,
            oauthUrl = client.getAuthorizeURL(domain + '/weixin/callback', '', 'snsapi_base');

        //存储授权来源url
        req.session.wechat_auth_origin = originalUrl;

        //取openid
        var openId = req.session.wechat_auth && req.session.wechat_auth.openid;

        //没有openid，先进行静默授权
        if (!openId) {
            return res.redirect(oauthUrl);
        }
        next();
    },
    /*
     * 微信
     * */
    wechat: function (req, res, next) {
        var args = arguments;
        /*
         * 页面进来之后，先进行一次静默授，{scope: 'snsapi_base'}
         * 获取到用户的openid后，去数据库中查是否存在。不存在，则重新跳转一次主动授权登录，{scope: 'snsapi_userinfo'}；存在，则进行自动登录。
         * */

        var domain = req.protocol + '://' + req.get('host'),
            originalUrl = domain + req.originalUrl,
            oauthUrl = client.getAuthorizeURL(domain + '/weixin/callback', '', 'snsapi_base');

        //存储授权来源url
        originalUrl = originalUrl.replace(/\/(center|cart|store|goods)(\/)?$/gi, '/$1#/');  //解决url带有hash的问题
        req.session.wechat_auth_origin = originalUrl;

        //取openid
        var openId = req.session.wechat_auth && req.session.wechat_auth.openid;

        //没有openid，先进行静默授权
        if (!openId) {
            return res.redirect(oauthUrl);
        }

        //查询库中是否存在该用户
        HttpClient.request(args, {
            url: API.verifyOpenId,
            data: {openId: openId},
            success: function (data, $data) {
                if (data.memberId) {
                    //已存在该用户，自动登录，获取用户token，更新session
                    //这个地方理论上不需要再次取微信头像，首次绑定的时候会存到库中
                    log.info("wechat-------------------$data", JSON.stringify($data));
                    req.session.user = $data;
                    log.info('[用户已存在, user_session]--->', JSON.stringify(req.session));

                    //地理位置
                    OAuth.location(req, res, next);
                }
            },
            error: function (data) {
                //此时如果有微信用户信息说明用户已经主动点击了授权按钮，可以直接跳到下一步逻辑
                if (req.session.wechat_user) {
                    log.info('[用户不存在，session中有微信用户信息，跳到下一步]');
                    log.info('[user_session]--->', JSON.stringify(req.session));

                    //地理位置
                    return OAuth.location(req, res, next);
                } else {
                    log.info('[用户不存在，跳转到主动授权]');
                    //主动授权url
                    oauthUrl = client.getAuthorizeURL(domain + '/weixin/callback', '', 'snsapi_userinfo');
                    res.redirect(oauthUrl); //用户不存在
                }
            }
        });
    },
    /*
     * 妈妈好内部
     * */
    mamahao: function (req, res, next) {
        var userInfo = req.cookies && req.cookies['mmh_app_user_info'];
        if (userInfo) {
            // 妈妈好内部，获取到了用户信息cookie;
            log.info("mmh_app_user_info---->", userInfo);
            var json = JSON.parse(crypto.newDecipher(userInfo));
            if (json.memberId) {
                // 妈妈好端已登录;
                log.info("[妈妈好端已登录]：userInfo--->", userInfo);
                var user_session = {
                    memberId: json.memberId,
                    token: json.token,
                    avatar: json.header,
                    nickname: json.nickname
                };
                log.info("妈妈好内部user_session--->", JSON.stringify(user_session));
                req.session.user = user_session; //设置当前用户到session
            } else {
                log.info("妈妈好内部用户未登录------>");
            }
        } else {
            // 内部没有 mamahao_app_user_info cookie的时候;
            log.info("妈妈好内部，但未获取到 mmh_app_user_info || mamahao_app_user_info");
        }

        //地理位置
        OAuth.location(req, res, next);
    },
    /*
     * 地理位置
     * */
    location: function (req, res, next) {
        //判断是否有地理位置信息
        var mmh_location = req.cookies && req.cookies['mmh_app_location'];
        if (!mmh_location) {
            return res.render('check_location');
        }
        next();
    },
    /*
     * 认证集合
     * */
    authentication: function (req, res, next) {
        var args = arguments;

        var userAgent = req.get("user-agent"),
            isWeChat = /micromessenger/gi.test(userAgent),
            isMamahao = /mamhao|mamahao/gi.test(userAgent);


        //已登录，则直接跳过，不需要再次授权
        if (req.session && req.session.user && req.session.user.memberId) {
            //地理位置
            return OAuth.location(req, res, next);
        }

        if (isWeChat) {
            return OAuth.wechat(req, res, next);
        }

        if (isMamahao) {
            return OAuth.mamahao(req, res, next);
        }

        next();

    }

};

module.exports = OAuth;