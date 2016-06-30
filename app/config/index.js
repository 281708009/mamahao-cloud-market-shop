/**
 * 环境配置
 */
var path = require("path");
//production  || development
var env = process.env.NODE_ENV || 'development';
env = env.toLowerCase().trim();

//载入配置文件
var configFile = path.resolve(__dirname, env);
try {
    var config = module.exports = require('./' + env);
    console.log('Load config: [%s] %s', env, configFile);
} catch (err) {
    console.error('Cannot load config: [%s] %s', env, configFile);
    throw err;
}