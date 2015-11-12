// Karma configuration
// Generated on Wed Nov 11 2015 22:01:19 GMT+0100 (Central European Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-as-promised', 'chai'],


    // list of files / patterns to load in the browser
    files: [
      'test/**/*.ts',
      'dist/libs.js'
    ],

    // list of files to exclude
    exclude: [
    ],


    preprocessors: {
        'test/**/*.ts': ['webpack']
    },

    webpack: {
      output: {
        filename: 'bundle.js',
      },

      resolve: {
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
      },

      module: {
        loaders: [
          { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
      }
    },

    webpackMiddleware: {
        noInfo: true
    },

    plugins: [
      require('karma-mocha'),
      require('karma-chrome-launcher'),
      require('karma-webpack'),
      require('karma-chai'),
      require('karma-chai-as-promised'),
    ],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultanous
    concurrency: Infinity
  })
}
