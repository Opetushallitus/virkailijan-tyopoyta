const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const baseConfig = require('./base.config.js')
const PATHS = require('./paths.js')

module.exports = merge(baseConfig, {
  output: {
    path: PATHS.dev
  },

  devtool: 'source-map',

  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: 'errors-only'
  },

  plugins: [
    new CleanWebpackPlugin([PATHS.dev], {
      root: process.cwd()
    })
  ]
})
