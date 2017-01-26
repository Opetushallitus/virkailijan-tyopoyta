const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const validate = require('webpack-validator');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const webpack = require('webpack');

const PATHS = {
  build: path.join(__dirname, 'build'),
  app: path.join(__dirname, 'app'),
  style: path.join(__dirname, 'app/resources/styles'),
  images: path.join(__dirname, 'app/resources/img'),
  fonts: path.join(__dirname, 'app/resources/fonts')
};

const config = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    publicPath: "./",
    filename: '[name].js',
    chunkFilename: '[id].js',
    publicPath: '/virkailijan-tyopoyta/'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets:['es2015', 'react'],
          plugins: ["transform-object-rest-spread"]
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      {
        test: /\.woff|\.woff2|\.svg|.eot|\.ttf/,
        loader: "file"
      },
      {
        test: /\.(jpg|png|gif)$/,
        loader: 'file',
        include: PATHS.images
      },
      {
        test: /\.css$/,
        loader: 'style!css!postcss-loader',
        include: PATHS.style
      }
    ]
  },
  postcss: function (webpack) {
    return [
      require("postcss-smart-import")({ addDependencyTo: webpack }),
      require("postcss-cssnext")()
    ]
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: 'errors-only',
  },

  plugins: [
    new ExtractTextPlugin("[name].css"),
    new CleanWebpackPlugin([PATHS.build], {
      root: process.cwd()
    }),
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      title: 'Login',
      appMountId: 'app',
      inject: false
    }),
    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    })
  ]
};

module.exports = validate(config);
