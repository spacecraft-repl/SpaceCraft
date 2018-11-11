const path    = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/client.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/public/',
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/y.*/),  // TODO: lookup
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
};
