import webpack from 'webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import merge from 'webpack-merge';
import { execSync } from 'child_process';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import baseConfig from './webpack.config.base';

// Gather production dependencies to copy to `dist`
const deps = execSync('npm list --prod --parseable')
  .toString()
  .split(/\n/)
  .map(line => line.replace(`${__dirname}/`, ''))
  .filter(line => !!line && (line.match(/\//g) || []).length === 1);

const plugins = [
  new CopyWebpackPlugin([
    // Main Dependencies
    { from: 'main.js' },
    { from: 'app/app.html', to: 'app/app.html' },
    { from: 'app/viewer.html', to: 'app/viewer.html' },
    // Theme Resources
    { from: 'themes', to: 'themes' },
    { from: 'node_modules/highlight.js/styles', to: 'themes/highlight-js' },
    // Information
    { from: 'package.json' },
  ].concat(
    // Add Additional Module Resources
    deps.map(line => ({ from: line, to: line }))
  ))
];

const config = merge(baseConfig, {
  devtool: 'cheap-module-source-map',

  entry: {
    bundle: './app/index',
    viewer: './app/viewer',
  },

  output: {
    publicPath: '../dist/',
  },

  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract(
          'style',
          [
            'css',
            'postcss',
          ]
        )
      },
    ],
  },

  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.appPath': JSON.stringify(__dirname),
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    }),
    new ExtractTextPlugin('style.css', { allChunks: true }),
    ...plugins,
  ],

  target: 'electron-renderer'
});

export default config;
