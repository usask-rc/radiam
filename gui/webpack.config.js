module.exports = {
  devtool: 'inline-source-map',
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'] // include eslint-loader
      }
    ]
  },
  externals: {
    react: "react",
    "react-dom": "react-dom",
    "react-router-dom": "react-router-dom",
    "react-router": "react-router",
  },
  peerDependencies: {
    "react-router-dom": "react-router-dom",
    "react-router": "react-router",
  },
};