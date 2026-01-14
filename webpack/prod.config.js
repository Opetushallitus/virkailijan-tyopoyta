const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const baseConfig = require('./base.config.js')
const PATHS = require('./paths.js')

module.exports = merge(baseConfig, {
  mode: 'production',
  output: {
    path: PATHS.build,
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js',
    sourceMapFilename: '[file].map'
  },

  bail: true,

  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [PATHS.build]
    })
  ],

  devtool: 'source-map'
})
