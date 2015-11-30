const path = require('path');
const RewirePlugin = require("rewire-webpack");
const webpack = require('webpack');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-as-promised', 'chai'],

    // list of files / patterns to load in the browser
    files: [
      'test/main.ts',
      'dist/libs.js'
    ],

    // list of files to exclude
    exclude: [
      'test/**/*Tests.js'
    ],

    preprocessors: {
        'test/main.ts': 'webpack'
    },

    coverageReporter: {
      type : 'json',
      subdir : '.'
    },

    plugins: [
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-ie-launcher'),
      require('karma-webpack'),
      require('karma-chai'),
      require('karma-chai-as-promised'),
      require('karma-coverage')
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    autoWatchBatchDelay: 5000,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Firefox'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity,

    webpack: {
      // watch: true,
      // watchDelay: 5000,

      devtool: 'source-map',

      plugins: [
        new webpack.optimize.UglifyJsPlugin(),
        new RewirePlugin()
      ],

      resolve: {
        extensions: ['', '.ts']
      },

      module: {
        loaders: [
          {
            test: /\.ts$/,
            exclude: /node_modules/,
            loader: 'ts-loader'
          }
        ],

        postLoaders: [
            {
                test: /\.ts$/,
                include: path.resolve('src/'),
                loader: 'istanbul-instrumenter'
            }
        ]
      }
    },

    webpackMiddleware: {
        noInfo: true
    }
  })
}
