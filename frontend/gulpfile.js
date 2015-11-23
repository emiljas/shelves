var gulp = require('gulp');
var originalWebpack = require('webpack');
var webpack = require('webpack-stream');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var replace = require('gulp-replace');
var Server = require('karma').Server;
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

gulp.task('watch', function() {
  gulp.start('test');
  watch('src/**/*.ts', function() {
    gulp.start('ts2js');
  });

  watch('lib/*.js', function() {
    gulp.start('concatLibs');
  });
});

gulp.task('test', function (done) {
  var server = new Server({
    configFile: __dirname + '/karma.conf.js'
  }, function(isError) {
      if(isError) {
        console.log("Task 'test' will be restarted after 15 seconds")
        setTimeout(function() {
          console.log("Task 'test' restarted after error");
          gulp.start('test');
        }, 15000);
      }
      done();
  });
  server.start();

  server.on('browser_complete', function() {
    gulp.src('coverage/coverage-final.json')
      .pipe(replace('.ts', '.js'))
      .pipe(remapIstanbul({
        reports: {
          'html': 'coverage'
        }
      }));
  });
});

gulp.task('ts2js', function() {
  return gulp.src('src/main.ts')
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(gulp.dest('dist'));
});

gulp.task('concatLibs', function() {
  return gulp.src('lib/*.js')
  .pipe(webpack({
    output: {
      filename: 'libs.js'
    },

    module: {
      loaders: [
        { test: /\.js$/, loader: 'script-loader' }
      ]
    }
  }))
  .pipe(gulp.dest('dist'));
});
