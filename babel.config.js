const config = function (api) {
	api.cache(true);
	return {
		presets: [
			'babel-preset-expo',
			['@babel/preset-react', { runtime: 'automatic' }],
		],
		plugins: [],
	};
};

module.exports = config;

