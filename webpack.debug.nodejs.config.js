// help: http://webpack.github.io/docs/configuration.html
// help: https://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const loaders = require('./webpack.loaders');
const plugins = require('./webpack.plugins');

console.log('');
console.log('DEBUG with devtools in nodeJs ');
console.log('WARNING: yous should run the `npm run debug-build` in order to debug your latest changes!');
console.log('');

const config = {
  target: 'node', // help: https://webpack.github.io/docs/configuration.html#target
  entry: [
    // the entry application code
    path.resolve(__dirname, 'debug/index.ts')
  ],
  output: {
    path: path.resolve(__dirname, 'debug-ground/debug-on-nodejs'),
    filename: 'index.js'
  },
  resolve: {
    alias: {},
    extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    loaders: loaders
  },
  node: {
    fs: "empty"
  },
  plugins: plugins,
};

module.exports = config;
