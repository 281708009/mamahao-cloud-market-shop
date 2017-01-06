// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var del = require('del');

var sftp = require('gulp-sftp');

var Config = {
    output: './dist/1.3',    //输出路径
    sftp: {
        host: '121.40.134.23',
        port: '22',
        user: 'web',
        pass: 'mmh@343Abd#',
        remotePath: '/home/web/s/m/v1/js',
        localPath: './dist/**'
    }
};

var jshintConfig = {
    maxerr: 120,
    eqeqeq: false,
    sub: true

};

// 检查脚本
gulp.task('lint', function () {
    return gulp.src([
        './modules/3rd/*.js',
        './modules/app/*.js',
        './modules/jquery/dropload.js',
        './modules/jquery/swipe.js'
    ])
        .pipe(jshint(jshintConfig))
        .pipe(jshint.reporter('jshint-stylish'));
});

// 合并，压缩文件
gulp.task('scripts', ['clean'], function () {
    return gulp.src([
        './modules/*/*.js',
        '!./modules/seajs/*.js',
        '!./modules/vue/*.js',
        '!./modules/app/common.js'
    ])
        .pipe(uglify({
            //mangle: true,//类型：Boolean 默认：true 是否修改变量名
            mangle: {except: ['require', 'exports', 'module', '$']}//排除混淆关键字
        }))
        .pipe(gulp.dest(Config.output));
});

gulp.task('clean', function (cb) {
    return del([Config.output], cb);
});

gulp.task('watch', function () {
    // 监听文件变化
    gulp.watch('./modules/*/*.js', ['lint', 'scripts']);
});

//构建
gulp.task('build', ['lint', 'scripts'], function () {
    //单独针对common.js全局压缩
    return gulp.src(['./modules/app/common.js'])
        .pipe(uglify())
        .pipe(gulp.dest(Config.output + '/app'));


});

// 默认任务
gulp.task('default', ['build'], function () {
    // gulp.src(Config.sftp.localPath)
    //     .pipe(sftp(Config.sftp));
});
