module.exports = [
	{
		test: /\.js$/,
		use: [
			'babel-loader',
		],
	},
	{
		// typescript loader
		test: /\.(tsx|ts)$/,
		use: [
			'babel-loader',
			'awesome-typescript-loader',
		],
	},
];
