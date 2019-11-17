import Vue from 'vue';
import Vuex from 'vuex';
import state from './state';
import mutations from './mutations';
import actions from './actions';
import getters from './getters';
import pubStore from '@/frames/public/vuex/store';

Vue.use( Vuex );

export default new Vuex.Store( {
  modules: {
    pubStore
  },
  state,
  actions,
  mutations,
  getters
} );
