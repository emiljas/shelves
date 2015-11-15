var gulp = require('gulp');
var watch = require('gulp-watch');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var gutil = require('gulp-util');

gulp.task('unitTests', function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'dot'
    }))
    .on('error', gutil.log);
});

gulp.task('restartApp', function() {
  nodemon({
      script: 'src/app.js',
      ext: 'html js',
      delay: 1000,
      ignore: ['ignored.js'],
      tasks: ['unitTests']
    })
    .on('restart', function() {
      console.log('app restarted');
    });
});

gulp.task('watch', function() {
  watch(['src/**/*.js', 'test/**/*.js'], function() {
    gulp.start('restartApp');
  });
});
