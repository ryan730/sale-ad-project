////process.env.NODE_ENV = 'dev';

const packages = require( '../modules/packages' );
const express = packages.express;
const app = express();
const path = require( 'path' );
const webpackConfig = require( '../webpack.config' );
const compiler = packages.webpack( webpackConfig );
const devMiddleware = packages.webpackDevMiddleware( compiler, {
  publicPath: webpackConfig.output.publicPath,
  quiet: true
} );
const hotMiddleware = packages.webpackHotMiddleware( compiler, {
  log: false,
  overlay: true,
  reload: true,
  heartbeat: 2000
} );
const port = 3000;

app.use( devMiddleware );
app.use( hotMiddleware );
app.use( express.static( path.join( __dirname, '../../dist' ) ) );

// todo: 编译 jade 模板后，设置 hotMiddleware.action 在 client.js 中读取，控制浏览器刷新
compiler.plugin( 'compilation', compilation => {
  compilation.plugin( 'html-webpack-plugin-after-emit', ( data, cb ) => {
    hotMiddleware.publish( {
      action: 'reload'
    } );
    cb();
  } );
} );

const spinner = packages.ora( 'Starting dev server...' ).start();

devMiddleware.waitUntilValid( () => {
  spinner.succeed( 'Listening at http://localhost:' + port );
} );

app.listen( port );
