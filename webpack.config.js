const path    = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',
  // devtool: 'inline-source-map',
  entry: './public/client.js',
  devServer: {
    contentBase: './public',
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',
  },
  plugins: [
    new webpack.ContextReplacementPlugin(/y.*/),  // TODO: lookup
  ],
}
