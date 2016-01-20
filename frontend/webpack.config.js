const webpack = require('webpack');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

var workerFileNames = glob.sync('./src/**/*.worker.ts');
workerFileNames = _.map(workerFileNames, function(fileName) {
  return fileName.replace('./src', '.');
});

module.exports = {
    context: __dirname + '/src',
    entry: ['./main.ts'].concat(workerFileNames),

    output: {
      path: __dirname,
      filename: 'dist/bundle.js'
    },

    plugins: [
      // new webpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.worker.js', '.worker.ts', '.ts', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: [/node_modules/],
          loader: 'ts-loader'
        }
      ],
      postLoaders: [
        {
          test: /\.worker\.ts/,
          loader: 'worker?inline&name=dist/[hash].worker.js'
        }
      ]
    }
};
