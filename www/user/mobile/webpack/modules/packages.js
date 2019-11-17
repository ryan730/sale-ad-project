module.exports = {
  webpack: require( 'webpack' ),
  express: require( 'express' ),
  ora: require( 'ora' ),
  chalk: require( 'chalk' ),
  ExtractTextPlugin: require( 'extract-text-webpack-plugin' ),
  ManifestPlugin: require( 'webpack-manifest-plugin' ),
  HtmlWebpackPlugin: require( 'html-webpack-plugin' ),
  UglifyJSPlugin: require( 'uglifyjs-webpack-plugin' ),
  CopyWebpackPlugin: require( 'copy-webpack-plugin' ),
  FriendlyErrorsWebpackPlugin: require( 'friendly-errors-webpack-plugin' ),
  webpackDevMiddleware: require( 'webpack-dev-middleware' ),
  webpackHotMiddleware: require( 'webpack-hot-middleware' ),
  postsStylus: require( 'poststylus' ),
  autoprefixer: require( 'autoprefixer' ),
  BundleAnalyzerPlugin: require( 'webpack-bundle-analyzer' ).BundleAnalyzerPlugin,
  eslintFriendlyFormatter: require( 'eslint-friendly-formatter' ),
  merge: require( 'webpack-merge' )
};
