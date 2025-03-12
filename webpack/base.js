const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
	mode: "development",
	devtool: "eval-source-map",
	entry: "./src/scripts/index.ts",
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
		}),
	],
};
