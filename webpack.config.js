module.exports = {
  context: __dirname + '/app',
  entry: './entry',
  mode: 'none',
  output: {
    path: __dirname + '/public/javascripts',
    filename: 'bundle.js',
    hashFunction: "xxhash64"
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }]
  }
};
