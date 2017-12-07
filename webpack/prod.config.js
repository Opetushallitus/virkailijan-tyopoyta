const webpack = require('webpack')
const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const baseConfig = require('./base.config.js')
const PATHS = require('./paths.js')

module.exports = merge(baseConfig, {
  output: {
    path: PATHS.build
  },

  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      comments: false,
      sourceMap: false
    }),
    new CleanWebpackPlugin([PATHS.build], {
      root: process.cwd()
    })
  ]
})
