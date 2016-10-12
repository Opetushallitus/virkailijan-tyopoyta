const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const validate = require('webpack-validator');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

const webpack = require('webpack');

const PATHS = {
  webapp: path.join(__dirname, 'src/main/webapp/app'),
  app: path.join(__dirname, 'app'),
  style: path.join(__dirname, 'app/resources/styles'),
  images: path.join(__dirname, 'app/resources/img'),
  fonts: path.join(__dirname, 'app/resources/fonts')

};

var config = {
  entry: {
    app: PATHS.app
  },
  output: {
    path: PATHS.webapp,
    filename: '[name].js',
    chunkFilename: '[id].js'
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
        loader: ExtractTextPlugin.extract("style-loader", "css-loader"),
        // include: PATHS.style
      },
      {
        test: /\.scss/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader"),
        // include: PATHS.style
      }
    ]
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    stats: 'errors-only',
  },

  plugins: [
    //new LiveReloadPlugin({appendScriptTag:true}),
    new ExtractTextPlugin("[name].css"),
    new CleanWebpackPlugin([PATHS.webapp], {
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