const gulp = require('gulp');
const shell = require('gulp-shell');
const originalWebpack = require('webpack');
const webpack = require('webpack-stream');
const watch = require('gulp-watch');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const Server = require('karma').Server;
const remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');

gulp.task('watch', ['build', 'ts2js', 'concatLibs', 'sass'], function() {
  gulp.start('test');

  watch('src/**/*.ts', function() {
    gulp.start('ts2js');
  });

  watch('lib/*.js', function() {
    gulp.start('concatLibs');
  });

  watch('style.scss', function() {
    gulp.start('sass');
  });
});

gulp.task('build', shell.task(['tsc']));

gulp.task('test', function (done) {
  const server = new Server({
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
  .pipe(plumber())
  .pipe(webpack(require('./webpack.config.js')))
  .pipe(gulp.dest('.'))
  .pipe(gulp.dest('../../../inetpub/wwwroot/RossmannV4Dnn/DesktopModules/RossmannV4Modules/Shelves2/Js'));
});

gulp.task('sass', function() {
  return gulp.src('style.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('.'))
    .pipe(gulp.dest('../../../inetpub/wwwroot/RossmannV4Dnn/DesktopModules/RossmannV4Modules/Shelves2/Css'));
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
