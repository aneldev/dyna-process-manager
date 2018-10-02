// help: http://webpack.github.io/docs/tutorials/getting-started/
// help: https://webpack.github.io/docs/webpack-dev-server.html#webpack-dev-server-cli

const fs = require('fs');

module.exports = [
  {
    // Javascript and JSX loader
    test: /\.(jsx|js)$/,
    loader: 'babel-loader',
    query: {
      presets: ["es2015", "stage-2"],
    }
  },
  {
    // typescript loader
    test: /\.(tsx|ts)$/,
    loader: 'awesome-typescript-loader',
    query: {
      ignoreDiagnostics: [
        // for codes see at:https://github.com/Microsoft/TypeScript/blob/master/src/compiler/diagnosticMessages.json
        // 2304, // Cannot find name '{0}
        // 2305, // '{0}' has no exported member '{1}'
        // 2307, // Cannot find module '{0}'
        // 2339, // Property '{0}' does not exist on type '{1}'
        // 2346, //Supplied parameters do not match any signature of call target.
      ]
    }
  },
  {	// json loader
    test: /\.json$/, loader: "json-loader"
  },
  // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
  {test: /\.js$/, loader: "source-map-loader"}
];
