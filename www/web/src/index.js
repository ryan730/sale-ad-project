// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from './vuex/store';
import Index from './index.vue';
import router from './router';
import ElementUI from 'element-ui';
import mixin from '@/core/mixin';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false;

Vue.use( ElementUI );

// todo: 全局注册 mixin
mixin( Vue );

/* eslint-disable no-new */
window.$vue = new Vue( {
  el: '#main',
  store,
  router,
  components: { Index },
  render: callback => callback( Index )
} );
