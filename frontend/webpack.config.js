module.exports = {
    watch: true,

    context: __dirname + '/src',
    entry: './main.ts',

    output: {
      path: __dirname + '/dist',
      filename: 'bundle.js'
    },

    // devtool: 'source-map',

    plugins: [
      // new originalWebpack.optimize.UglifyJsPlugin()
    ],

    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },

    module: {
      loaders: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          loader: 'babel-loader?presets=es2015!ts-loader'
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }
      ]
    }
  };
