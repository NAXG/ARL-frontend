const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

function loadEnvironment() {
  const mode = process.env.NODE_ENV || 'development';
  const envFiles = [
    `.env.${mode}.local`,
    `.env.${mode}`,
    `.env.local`,
    '.env'
  ];

  const envConfig = envFiles.reduce((acc, file) => {
    const filePath = path.resolve(__dirname, file);
    if (!fs.existsSync(filePath)) {
      return acc;
    }

    const parsed = dotenv.parse(fs.readFileSync(filePath));
    return { ...acc, ...parsed };
  }, {});

  return {
    mode,
    envConfig
  };
}

const { mode: runtimeMode, envConfig } = loadEnvironment();

const envDefinitions = Object.entries(envConfig).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [`process.env.${key}`]: JSON.stringify(value)
  }),
  { 'process.env.NODE_ENV': JSON.stringify(runtimeMode) }
);

module.exports = {
  entry: path.resolve(__dirname, 'src', 'main.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      vue$: 'vue/dist/vue.runtime.esm-bundler.js'
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.less$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true
              }
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)$/,
        type: 'asset/resource'
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public', 'index.html'),
      inject: 'body'
    }),
    new webpack.DefinePlugin({
      ...envDefinitions,
      __VUE_OPTIONS_API__: JSON.stringify(true),
      __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      __VUE_PROD_DEHYDRATION_FULL__: JSON.stringify(false),
      __VUE_PROD_DEHYDRATION_WHITELIST__: JSON.stringify(false)
    })
  ]
};
