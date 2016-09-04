/* eslint max-len: 0 */
import webpack from 'webpack';
import merge from 'webpack-merge';
import baseConfig from './webpack.config.base';

const port = process.env.PORT || 3000;

export default merge(baseConfig, {
  debug: true,

  devtool: 'cheap-module-eval-source-map',

  entry: {
    bundle: [
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      './app/index',
    ],
    viewer: [
      `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr`,
      './app/viewer',
    ],
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loaders: ['style', 'css?sourceMap', 'postcss?sourceMap']
      },
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
      'process.appPath': JSON.stringify(__dirname),
    }),
  ],

  target: 'electron-renderer'
});
