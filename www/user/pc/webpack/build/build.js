const { exec } = require( 'child_process' );
const path = require( 'path' );
const fs = require( 'fs' );
const ora = require( 'ora' );
const spinner = ora( 'Starting build compiling...' ).start();
const packages = require( '../modules/packages' );
const webpackConfig = require( '../webpack.config' );
const resolve = ( src ) => {
  return path.resolve( __dirname, '../../', src || '' );
};

exec( 'rm -rf dist/css dist/js/libs dist/js/*.*.js dist/images dist/*.json dist/*.html', err => {
  if ( err ) throw err;

  packages.webpack( webpackConfig, ( err, stats ) => {
    let mfJson, mfDllJson;

    if ( err ) throw err;

    process.stdout.write( '\n\n' + stats.toString( {
      colors: true,
      modules: true,
      children: true,
      chunks: false,
      chunkModules: false
    } ) + '\n\n' );

    mfJson = require( resolve( 'dist/mf.json' ) );
    mfDllJson = require( resolve( 'dist/js/dll/mf.dll.json' ) );
    fs.writeFileSync( resolve( 'dist' ) + '/mf.json', JSON.stringify( packages.merge( mfJson, mfDllJson ) ) );

    spinner.succeed( 'Complate build compile!' );
  } );
} );
