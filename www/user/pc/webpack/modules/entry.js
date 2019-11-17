const glob = require( 'glob' );
const path = require( 'path' );

module.exports = () => {
  const resolve = ( src ) => {
    return path.resolve( __dirname, '../../', src || '' );
  };
  let files = glob.sync( resolve( 'src' ) + '/*.js' );
  let entry = {};

  files.forEach( file => {
    let name = path.basename( file, '.js' );

    entry[name] = file;
  } );

  return entry;
};
