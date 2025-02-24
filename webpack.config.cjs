const path = require('path');
const DEV = process.env.MODE === 'development';

module.exports = {
  mode: DEV ? 'development' : 'production',
  entry: './src/index.ts',
  target: 'node',
  output: {
    filename: 'cli.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  watch: DEV,
  watchOptions: {
    ignored: /node_modules/,
  },
};