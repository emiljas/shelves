const webpack = require('webpack');
const path = require('path');

module.exports = {
    // watch: true, //not working in workplace

    context: __dirname + '/src',
    entry: ['./threads/number.worker.ts', './main.ts'],

    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js'
    },

    devtool: 'source-map',

    plugins: [
      new webpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.worker.js', '.worker.ts', '.ts', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: [/node_modules/, './threads/number.worker.ts'],
          loader: 'ts-loader'
        }
      ],
      postLoaders: [
        {
          test: /\.worker\.ts/,
          // include: path.resolve(__dirname, 'src/threads/number.worker.ts'),
          // include: path.resolve('.'),
          loader: 'worker?inline&name=dist/[hash].worker.js'
        }
      ]
    }
};
