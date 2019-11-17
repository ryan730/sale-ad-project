process.env.buildBundleAnalyzerReport = false;

const path = require( 'path' );
const packages = require( './modules/packages' );
const entry = require( './modules/entry' )();
const rules = require( './modules/rules' )( packages );
const plugins = require( './modules/plugins' )( packages );
const resolve = require( './modules/resolve' )( packages );

if ( process.env.NODE_ENV === 'dev' ) {
  Object.keys( entry ).forEach( name => {
    entry[name] = [ path.resolve( __dirname, 'modules/client' ) ].concat( entry[name] );
  } );
}

module.exports = {
  entry,
  output: {
    path: path.resolve( __dirname, '..', 'dist' ),
    filename: process.env.NODE_ENV === 'dev' ? 'js/[name].js' : 'js/[name].[chunkhash:8].js',
    publicPath: process.env.publicPath
  },
  module: {
    rules
  },
  devtool: process.env.NODE_ENV === 'dev' ? 'inline-source-map' : false,
  plugins,
  resolve
};
