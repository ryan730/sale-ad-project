import Vue from 'vue';
import Router from 'vue-router';
import iView from 'iview';
import Index from 'vpages/Index.vue';
import Login from 'vpages/Login.vue';
import List from 'vpages/List.vue';
import ShoppingCart from 'vpages/ShoppingCart.vue';
import PayInLine from 'vpages/PayInLine.vue';
import Success from 'vpages/Success.vue';
import ConfirmOrder from 'vpages/ConfirmOrder.vue';
import Details from 'vpages/Details.vue';
import Information from 'vpages/Information.vue';
import Personal from 'vpages/Personal.vue';

Vue.use( Router );
Vue.use( iView );

export default new Router( {
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/list/:id',
      name: 'list',
      component: List
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: Details,
      meta: ['首页', '购买红酒']
    },
    {
      path: '/cart',
      name: 'cart',
      component: ShoppingCart
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: ConfirmOrder
    },
    {
      path: '/pay',
      name: 'pay',
      component: PayInLine
    },
    {
      path: '/success/:type',
      name: 'success',
      component: Success,
      props: true
    },
    {
      path: '/information/:type',
      name: 'information',
      component: Information,
      props: true
    },
    {
      path: '/personal',
      name: 'personal',
      component: Personal
    }
  ]
} );
