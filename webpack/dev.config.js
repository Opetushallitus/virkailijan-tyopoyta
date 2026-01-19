const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const baseConfig = require('./base.config.js')
const PATHS = require('./paths.js')

module.exports = merge(baseConfig, {
  mode: 'development',
  output: {
    path: PATHS.dev,
    filename: '[name].js',
    chunkFilename: '[name].js'
  },

  devtool: 'inline-source-map',

  devServer: {
    static: {
      directory: PATHS.dev
    },
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: true
    },
    allowedHosts: 'all'
  },

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [PATHS.dev]
    })
  ]
})
