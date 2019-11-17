const path = require( 'path' );

module.exports = () => {
  const resolve = ( src ) => {
    return path.resolve( __dirname, '../../', src || '' );
  };

  return {
    alias: {
      '@': resolve( 'src' ),
      assets: resolve( 'src/assets/' ),
      images: resolve( 'src/assets/images' ),
      modules: resolve( 'src/modules' ),
      vpages: resolve( 'src/views/vue_pages' ),
      vx: resolve( 'src/vuex' )
    },
    extensions: ['.js']
  };
};
