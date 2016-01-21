var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var precss = require('precss');
var postcssCssnext = require('postcss-cssnext');
var postcssImport = require('postcss-import');
var postcssUrl = require('postcss-url');

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
	entry: {
		public: path.resolve(__dirname, 'root.js'),
		app: [path.resolve(__dirname, 'app', 'index.js')]
	},
	output: {
		path: path.resolve(__dirname, 'build'),
    publicPath: '/build/',
		filename: '[name].js'
	},
	devServer: {
    host: '127.0.0.1',
		port: 3333
	},
  devtool: 'eval-source-map',
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel',
				query: {
					presets: ['es2015', 'react']
				}
			},
			{
        test:   /\.css$/,
        loader: "style-loader!css-loader!postcss-loader"
      },
			{
				test: /\.(png|jpg|gif|svg|woff|ttf|otf|eot)$/,
				loader: 'url-loader?limit=8192'
			}
		]
	},
	postcss: function () {
    return [
      autoprefixer,
      precss,
      postcssImport({addDependencyTo: webpack}),
      postcssCssnext(),
      postcssUrl()
    ];
  },
	resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.json']
  },
  plugins: [definePlugin, commonsPlugin]
}
