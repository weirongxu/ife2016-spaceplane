var path = require('path')
var autoprefixer = require('autoprefixer')

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: './main.js',
  output: {
    filename: 'main.js',
    path: './build/assets/',
    publicPath: '/assets/',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-0'],
        },
      },
      {
        test: /\.(scss|sass)/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['style', 'css', 'postcss', 'sass'],
      },
    ],
  },
  postcss: function() {
    return [autoprefixer]
  },
  resolve: {
    extensions: ['', '.js'],
  },
}
