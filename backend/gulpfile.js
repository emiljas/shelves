var gulp = require('gulp');
var watch = require('gulp-watch');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

gulp.task('unitTests', function() {
    return gulp.src('test/**/*.js', { read: false })
        .pipe(mocha({ reporter: 'list' }))
        .on('error', gutil.log);
});

gulp.task('watch', function() {
  watch(['src/**/*.js', 'test/**/*.js'], function() {
    gulp.start('unitTests');
  });
});
