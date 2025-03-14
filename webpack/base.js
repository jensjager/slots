const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "eval-source-map",
	entry: "./src/scripts/index.ts",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "../docs"),
		publicPath: "/slots/",
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: "ts-loader",
				},
			},
			{
				test: /\.(png|mp3|jpe?g)$/i,
				use: "file-loader",
			},
		],
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	plugins: [
		new CleanWebpackPlugin({
			root: path.resolve(__dirname, "../"),
		}),
		new webpack.DefinePlugin({
			CANVAS_RENDERER: JSON.stringify(true),
			WEBGL_RENDERER: JSON.stringify(true),
		}),
		new HtmlWebpackPlugin({
			template: "./index.html",
			favicon: "./src/favicon.ico",
			meta: {
				"Content-Security-Policy": {
					"http-equiv": "Content-Security-Policy",
					content:
						"default-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; child-src 'none'; form-action 'self';",
				},
			},
		}),
	],
};
