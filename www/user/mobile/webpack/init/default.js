// todo: main.vue template content
const vue = `
<template lang="jade">
  #app
    router-view
</template>\n
<script>
  export default {
    name: 'app'
  };
</script>\n
<style lang="stylus" scoped></style>`;

// todo: main.js content
const js = `
import Vue from 'vue';
import router from './router/router';
import App from './App.vue';

new Vue( {
  el: '#main',
  router,
  components: { App },
  render: callback => callback( App )
} );
`;

// todo: router.js content
const router = `
import Vue from 'vue';
import Router from 'vue-router';
import Hello from 'modules/Hello.vue';

Vue.use( Router );

export default new Router( {
  routes: [
    {
      path: '/',
      name: 'hello',
      component: Hello
    }
  ]
} );
`;

// todo: hello.vue content
const hello = `
<template lang="jade">
  .hello {{ msg }}
</template>\n
<script>
  export default {
    name: 'hello',
    data() {
      return {
        msg: 'Welcome to Your Vue.js Appx'
      };
    }
  };
</script>\n
<style lang="stylus" scoped></style>`;

// todo: the content for vuex files
const vuex = `
export default {};
`;

// todo: the content for jade
const layout = `
doctype html
html
  head
    meta( charset='utf-8' )
    meta( name="viewport" )
    meta( name="format-detection" content="telephone=no" )
    meta( name="apple-mobile-web-app-capable" content="yes" )

  body
    block main

    block script
`;
const index = `
extends ../layouts/layout.jade

block main
  #main

block script
`;

module.exports = {
  vue,
  js,
  router,
  hello,
  vuex,
  layout,
  index
}
