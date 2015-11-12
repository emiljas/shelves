var gulp = require('gulp');
var originalWebpack = require('webpack');
var webpack = require('webpack-stream');
var watch = require('gulp-watch');
var concat = require('gulp-concat');

gulp.task('watch', function() {
  watch('src/**/*.ts', function() {
    gulp.start('ts2js');
  });

  watch('lib/*.js', function() {
    gulp.start('concatLibs');
  });
});

gulp.task('ts2js', function() {
  return gulp.src('src/main.ts')
  .pipe(webpack({
    output: {
      filename: 'bundle.js',
    },

    devtool: 'source-map',

    plugins: [
      new originalWebpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },

    module: {
      loaders: [
        { test: /\.tsx?$/, loader: 'ts-loader' }
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
    }
  }))
  .pipe(gulp.dest('dist'));

  //   .pipe(concat('libs.js'))
  //   .pipe(gulp.dest('dist'));
});
