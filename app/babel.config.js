const config = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', '@babel/preset-react',],
    
    plugins: [
      // Add any additional plugins here if needed
    ],
  };
};


export default config; 