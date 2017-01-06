var Schema = require('mongoose').Schema;

var userModel = Schema({
    Advertiser: {type: Schema.Types.ObjectId, ref: 'userModel'},
    Name: String,  //任务名称
    Intro: String,
    createdAt: {type: Date, default: Date.now()},
    updatedAt: {type: Date, default: Date.now()}
}, {collection: "person"});

var baseModel = require("./base_model");
userModel.statics = baseModel.statics;    // 添加 mongoose 静态方法，静态方法在Model层就能使用

/* global db */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;   //解决报错DeprecationWarning: Mongoose: mpromise过期的问题
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.on('open', function () {
    console.info('mongodb connect successful');
});
module.exports = db.model('mongoose', userModel);
