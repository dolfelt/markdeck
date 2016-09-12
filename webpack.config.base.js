import path from 'path';
import precss from 'precss';
import postcssMixins from 'postcss-mixins';
import postcssPartialImport from 'postcss-partial-import';

export default {
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.svg$/,
        loader: 'raw-loader',
      }
    ]
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
    packageMains: ['webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main'],
    modulesDirectories: ['node_modules', 'app'],
  },
  plugins: [

  ],
  externals: [
    'postcss',
    'postcss-mixins',
    'precss',
    'postcss-partial-import',
    // put your node 3rd party libraries which can't be built with webpack here
    // (mysql, mongodb, and so on..)
  ],
  postcss: () => [
    postcssPartialImport,
    postcssMixins,
    precss({
      properties: { disable: true },
      mixins: { disable: true },
      import: { disable: true },
    })
  ],
};
