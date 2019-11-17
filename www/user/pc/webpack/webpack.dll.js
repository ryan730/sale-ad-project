const path = require( 'path' );
const webpack = require( 'webpack' );
const ManifestPlugin = require( 'webpack-manifest-plugin' );
const resolve = ( src ) => {
  return path.resolve( __dirname, '../', src || '' );
};

module.exports = {
  entry: {
    bundle: [
      'vue',
      'vuex',
      'vue-router',
      'axios',
      'zepto',
      'iview',
      'lodash'
    ]
  },
  output: {
    path: resolve( 'dist/js/dll' ),
    filename: '[name].dll.[chunkhash:8].js',
    library: '[name]_library'
  },
  plugins: [
    new webpack.DllPlugin( {
      path: resolve( '[name]-dll.json' ),
      name: '[name]_library',
      context: resolve()
    } ),
    new webpack.optimize.UglifyJsPlugin( {
      compress: {
        warnings: false,
        drop_console: false
      },
      mangle: {
        except: ['$super', 'module', 'exports', 'require', 'vue', 'axios']
      }
    } ),
    new ManifestPlugin( {
      fileName: 'mf.dll.json',
      publicPath: process.env.publicPath + 'js/dll/' || 'js/dll/'
    } )
  ]
};
