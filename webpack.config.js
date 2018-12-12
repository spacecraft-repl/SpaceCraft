'use strict'

const path = require('path')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

// @todo: Verify all syntax is correct, and everything necessary is present.
module.exports = {
  mode: 'development',
  entry: './src/client.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/public/'
  },
  plugins: [
    // @todo: Verify what this does.
    new webpack.ContextReplacementPlugin(/y.*/),
    new CompressionPlugin({ algorithm: 'gzip' })
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        // Set up standard-loader as a preloader.
        enforce: 'pre',
        test: /\.js$/,
        loader: 'standard-loader',
        exclude: /(node_modules|main\.js|misc)/
      }
      // @todo: Uncomment.
      // {
      //   test: /\.(otf|ttf)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         name: 'fonts/[name].[ext]',
      //         context: '',
      //       },
      //     },
      //   ],
      // },
    ]
  }
}
