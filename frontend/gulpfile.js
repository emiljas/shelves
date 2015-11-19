var gulp = require('gulp');
var originalWebpack = require('webpack');
var webpack = require('webpack-stream');
var watch = require('gulp-watch');
var concat = require('gulp-concat');
var Server = require('karma').Server;

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
  new Server({
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
  }).start();
});

gulp.task('ts2js', function() {
  return gulp.src('src/main.ts')
  .pipe(webpack({
    watch: true,

    output: {
      filename: 'bundle.js',
    },

    // devtool: 'source-map',

    plugins: [
      new originalWebpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.ts']
    },

    module: {
      loaders: [
        { test: /\.ts$/, loader: 'ts-loader' }
      ]
    }
  }))
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
