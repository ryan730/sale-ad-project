const webpackDll = require( '../webpack.dll' );
const ora = require( 'ora' );
const spinner = ora( 'Starting dll compiling...' ).start();
const webpack = require( 'webpack' );


webpack( webpackDll, ( err, stats ) => {
  if ( err ) throw err;

  process.stdout.write( '\n\n' + stats.toString( {
    colors: true,
    modules: true,
    children: true,
    chunks: false,
    chunkModules: false
  } ) + '\n\n' );
  spinner.succeed( 'Complate dll compile!' );
} );
