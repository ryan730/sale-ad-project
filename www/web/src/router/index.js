import Vue from 'vue';
import Router from 'vue-router';

Vue.use( Router );

// todo: 公众端路由
const pubPath = 'frames/public/pages';
const Login = () => import( `@/${pubPath}/Login.vue` );
const Information = () => import( `@/${pubPath}/Information.vue` );
const Index = () => import( `@/${pubPath}/Index.vue` );
const List = () => import( `@/${pubPath}/List.vue` );
const Detail = () => import( `@/${pubPath}/Details.vue` );
const Cart = () => import( `@/${pubPath}/ShoppingCart.vue` );
const Order = () => import( `@/${pubPath}/ConfirmOrder.vue` );
const Pay = () => import( `@/${pubPath}/PayInLine.vue` );
const Mine = () => import( `@/${pubPath}/Personal.vue` );

// todo: 店员端路由

const routes = [
  {
    path: '',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'pub-login',
    component: Login
  },
  {
    path: '/information/:type',
    name: 'pub-information',
    component: Information,
    props: true
  },
  {
    path: '/index',
    name: 'pub-index',
    component: Index
  },
  {
    path: '/list/:id',
    name: 'pub-list',
    component: List
  },
  {
    path: '/detail/:id',
    name: 'pub-detail',
    component: Detail,
    meta: ['首页', '购买红酒'],
    props: true
  },
  {
    path: '/cart',
    name: 'pub-cart',
    component: Cart
  },
  {
    path: '/confirm',
    name: 'pub-confirm',
    component: Order
  },
  {
    path: '/pay',
    name: 'pub-pay',
    component: Pay
  },
  {
    path: '/personal/:type',
    name: 'pub-mine',
    component: Mine,
    props: true
  }
];

const router = new Router( {
  routes,
  scrollBehavior() {
    return {
      x: 0,
      y: 0
    };
  },
  strict: process.env.NODE_ENV !== 'production'
} );

export default router;
