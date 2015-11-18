var gulp = require('gulp');
var mocha = require('gulp-mocha');
var nodemon = require('gulp-nodemon');
var gutil = require('gulp-util');

gulp.task('watch', function() {
  nodemon({
      script: 'src/app.js',
      ext: 'html js',
      delay: 1000,
      ignore: [],
      tasks: ['test']
    })
    .on('restart', function() {
      console.log('app restarted');
    });
});

gulp.task('test', function() {
  return gulp.src('test/**/*.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'dots'
    }))
    .on('error', gutil.log);
});
