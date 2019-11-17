const path = require( 'path' );
const fs = require( 'fs' );
const mkdir = require( 'mkdirp' );
const ora = require( 'ora' );
const spinner = ora( 'Creating directory...' ).start();
const defaultPage = require( '../init/default' );
const resolve = ( src ) => {
  return path.resolve( __dirname, '../../', src || '' );
};

// todo: create 'src' directory
mkdir( resolve() + '/src', err => {
  if ( err ) throw err;

  // todo: create static directory: assets
  mkdir( resolve( 'src' ) + '/assets', err => {
    if ( err ) throw err;
    mkdir.sync( resolve( 'src/assets' ) + '/images' );
  } );

  mkdir( resolve( 'src/assets' ) + '/css', err => {
    if ( err ) throw err;
    mkdir.sync( resolve( 'src/assets/css' ) + '/common' );
  } );


  mkdir( resolve( 'src/assets' ) + '/js', err => {
    if ( err ) throw err;
    mkdir.sync( resolve( 'src/assets/js' ) + '/libs' );
  } );

  // todo: create jade templates directory
  mkdir( resolve( 'src' ) + '/views', err => {
    if ( err ) throw err;
    mkdir( resolve( 'src/views' ) + '/layouts', err => {
      if ( err ) throw err;
      fs.writeFileSync( resolve( 'src/views/layouts' ) + '/layout.jade', defaultPage.layout );
    } );
    mkdir( resolve( 'src/views' ) + '/pages', err => {
      if ( err ) throw err;
      fs.writeFileSync( resolve( 'src/views/pages' ) + '/index.jade', defaultPage.index );
    } );
  } );

  // todo: create vuex directory
  mkdir( resolve( 'src' ) + '/vuex', err => {
    if ( err ) throw err;
    fs.writeFileSync( resolve( 'src/vuex' ) + '/state.js', defaultPage.vuex );
    fs.writeFileSync( resolve( 'src/vuex' ) + '/mutations.js', defaultPage.vuex );
    fs.writeFileSync( resolve( 'src/vuex' ) + '/actions.js', defaultPage.vuex );
    fs.writeFileSync( resolve( 'src/vuex' ) + '/getters.js', defaultPage.vuex );
    fs.writeFileSync( resolve( 'src/vuex' ) + '/index.js', defaultPage.vuex );
  } );

  // todo: create units directory and sub directory which core, widgets, CONFIG, components
  mkdir( resolve( 'src' ) + '/units', err => {
    if ( err ) throw err;
    mkdir.sync( resolve( 'src/units' ) + '/core' );
    mkdir.sync( resolve( 'src/units' ) + '/widgets' );
    mkdir.sync( resolve( 'src/units' ) + '/CONFIG' );
    mkdir.sync( resolve( 'src/units' ) + '/components' );
  } );

  // todo: create page modules directory and file
  mkdir( resolve( 'src' ) + '/modules', err => {
    if ( err ) throw err;
    fs.writeFileSync( resolve( 'src/modules' ) + '/Hello.vue', defaultPage.hello );
  } );

  // todo: create routers directory and file
  mkdir( resolve( 'src' ) + '/router', err => {
    if ( err ) throw err;
    fs.writeFileSync( resolve( 'src/router' ) + '/router.js', defaultPage.router );
  } );

  // todo: create main entry files
  fs.writeFileSync( resolve( 'src' ) + '/main.js', defaultPage.js );
  fs.writeFileSync( resolve( 'src' ) + '/App.vue', defaultPage.vue );
  spinner.succeed( 'Create complate!' );
} );
