import Vue from 'vue';
import router from './router/router';
import Index from './Index.vue';

new Vue( {
  el: '#main',
  router,
  components: { Index },
  render: callback => callback( Index )
} );
