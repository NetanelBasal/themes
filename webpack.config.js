const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry  : './main.js',
  output : {
    filename: './dist/[name].js'
  },
  module : {
    rules: [

      {
        test   : /\.theme.css$/,
        exclude: /node_modules/,
        use    : ExtractTextPlugin.extract({
          allChunks: true,
          fallback : "style-loader",
          use      : [
            "css-loader",
            {
              loader : 'postcss-loader',
              options: {
                ident  : 'postcss',
                plugins: ( loader ) => [
                  require('./postcss-themes')
                ]
              }
            }
          ]
        })
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("./dist/main.css"),
  ],
};