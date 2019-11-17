
import Vue from 'vue';
import router from './router/router';
import Index from './index.vue';

calculatePage();

new Vue( {
  el: '#main',
  router,
  components: { Index },
  render: callback => callback( Index )
} );
