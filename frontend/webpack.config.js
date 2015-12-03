const webpack = require('webpack');

module.exports = {
    // watch: true, //not working in workplace

    context: __dirname + '/src',
    entry: './main.ts',

    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js'
    },

    devtool: 'source-map',

    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'ts-loader'
        }
      ]
    }
  };
