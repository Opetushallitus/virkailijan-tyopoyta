const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const validate = require('webpack-validator')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const esLintFriendlyFormatter = require('eslint-friendly-formatter')

const PATHS = require('./paths.js')

const config = {
  entry: {
    app: PATHS.app,
    style: PATHS.style,
    chat: PATHS.chat
  },

  output: {
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/virkailijan-tyopoyta/'
  },

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
          plugins: ['transform-object-rest-spread']
        }
      },
      {
        test: /\.jsx?$/,
        loader: 'eslint',
        include: PATHS.app + '/components',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
        loader: 'file'
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'file',
        include: PATHS.images
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss-loader')
      }
    ]
  },

  postcss: function (webpack) {
    return [
      require('postcss-smart-import')({ addDependencyTo: webpack }),
      require('postcss-cssnext')()
    ]
  },

  eslint: {
    formatter: esLintFriendlyFormatter,
    failOnError: true
  },

  plugins: [
    new webpack.EnvironmentPlugin([
      'NODE_ENV'
    ]),
    new ExtractTextPlugin('[name].css'),
    new HtmlWebpackPlugin({
      template: 'ui/app/index.html',
      title: 'App',
      appMountId: 'app',
      inject: false
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    })
  ]
}

module.exports = validate(config)
