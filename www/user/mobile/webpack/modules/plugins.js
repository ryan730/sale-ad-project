const path = require( 'path' );
const glob = require( 'glob' );
const resolve = ( src ) => {
  return path.resolve( __dirname, '../../', src || '' );
};
const htmlPlugin = ( HtmlWebpackPlugin ) => {
  const jadePath = resolve( 'src/views/pages/*.jade' );
  const jades = glob.sync( jadePath );
  let htmls = [];

  jades.forEach( jade => {
    let file = path.basename( jade, '.jade' ) + '.html';

    htmls.push(
      new HtmlWebpackPlugin( {
        filename: file,
        template: jade,
        inject: 'body'
      } )
    );
  } );

  return htmls;
};
const pluginsBase = options => {
  console.log('sdfsdfsdfsdf===>', process.env.NODE_ENV)
  return [
    new options.ExtractTextPlugin( {
      filename: process.env.NODE_ENV === 'dev' ? 'css/[name].css' : 'css/[name].[contenthash:8].css'
    } ),
    new options.webpack.optimize.CommonsChunkPlugin( {
      name: 'vendor',
      // todo: 重要！！！
      minChunks: function ( module, count ) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test( module.resource ) &&
          module.resource.indexOf(
            path.join( __dirname, '../node_modules' )
          ) === 0
        );
      },
      filename: 'js/libs/common.js'
    } ),
    new options.ManifestPlugin( {
      fileName: 'mf.json',
      publicPath: process.env.publicPath
    } ),
    new options.webpack.ProvidePlugin( {
      calculatePage: resolve( 'src/units/core/CalculatesPage.js' )
    } ),
    new options.webpack.LoaderOptionsPlugin( {
      options: {
        stylus: {
          use: [
            options.postsStylus( [
              options.autoprefixer( {
                browsers: [ 'ie >= 11', 'last 2 version', 'Firefox >= 20' ]
              } )
            ] )
          ]
        }
      }
    } ),
    new options.CopyWebpackPlugin( [
      {
        from: resolve( 'src/assets/css/common' ),
        to: 'css/common'
      }
    ] ),
    new options.CopyWebpackPlugin( [
      {
        from: resolve( 'src/assets/images' ),
        to: 'images'
      }
    ] ),
    new options.webpack.DllReferencePlugin( {
      context: resolve(),
      manifest: require( '../../bundle-dll.json' )
    } )
  ];
};

module.exports = options => {
  let plugins = pluginsBase( options ).concat( htmlPlugin( options.HtmlWebpackPlugin ) );

  if ( process.env.NODE_ENV === 'dev' ) {
    plugins.push(
      new options.webpack.HotModuleReplacementPlugin(),
      new options.webpack.NoEmitOnErrorsPlugin(),
      new options.FriendlyErrorsWebpackPlugin()
    );
  } else {
    plugins.push(
      new options.UglifyJSPlugin( {
        uglifyOptions: {
          ecma: 6,
          compress: {
            warnings: false,
            drop_console: false
          },
          sourceMap: false,
          mangle: {
            except: [ '$super', '$', 'module', 'exports', 'require' ]
          }
        }
      } )
    );
  }

  if ( process.env.buildBundleAnalyzerReport === 'true' ) {
    plugins.push(
      new options.BundleAnalyzerPlugin( {
        analyzerMode: 'static',
        reportFilename: 'report.html',
        defaultSizes: 'stat',
        openAnalyzer: true,
        generateStatsFile: false,
        statsOptions: null,
        logLevel: 'info'
      } )
    );
  }

  return plugins;
};
