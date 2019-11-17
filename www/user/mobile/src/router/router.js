import Vue from 'vue';
import Router from 'vue-router';
import Mint from 'mint-ui';
import Index from 'vpages/Index.vue';
import List from 'vpages/List.vue';
import Account from 'vpages/Account.vue';
import Cart from 'vpages/Cart.vue';
import EditAddr from 'vpages/EditAddr.vue';
import AddAddr from 'vpages/AddAddr.vue';
import AdminAddr from 'vpages/AdminAddr.vue';
import SetImage from 'vpages/Image.vue';
import Password from 'vpages/Password.vue';
import EditPassword from 'vpages/EditPassword.vue';
import PhoneNum from 'vpages/PhoneNum.vue';
import PhoneCode from 'vpages/PhoneCode.vue';
import Preferences from 'vpages/Preferences.vue';
import Mine from 'vpages/Mine.vue';
import Success from 'vpages/Success.vue';
import OrderCommit from 'vpages/OrderCommit.vue';
import Detail from 'vpages/Detail.vue';

Vue.use( Router );
Vue.use( Mint );

export default new Router( {
  routes: [
    {
      path: '/index',
      alias: '/index/:from',
      name: 'index',
      component: Index,
      props: true
    },
    {
      path: '/list/:id',
      name: 'list',
      component: List,
      props: true
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/cart/:from',
      name: 'cart',
      component: Cart,
      props: true
    },
    {
      path: '/addAddr',
      name: 'addAddr',
      component: AddAddr
    },
    {
      path: '/editAddr',
      name: 'editAddr',
      component: EditAddr
    },
    {
      path: '/adminAddr',
      name: 'AdminAddr',
      component: AdminAddr
    },
    {
      path: '/image',
      name: 'image',
      component: SetImage
    },
    {
      path: '/password',
      name: 'password',
      component: Password
    },
    {
      path: '/editPassword',
      name: 'editPassword',
      component: EditPassword
    },
    {
      path: '/phoneNum',
      name: 'phoneNum',
      component: PhoneNum
    },
    {
      path: '/phoneCode',
      name: 'phoneCode',
      component: PhoneCode
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: Preferences
    },
    {
      path: '/mine/:from',
      name: 'mine',
      component: Mine,
      props: true
    },
    {
      path: '/success',
      name: 'success',
      component: Success
    },
    {
      path: '/orderCommit',
      name: 'orderCommit',
      component: OrderCommit
    },
    {
      path: '/detail',
      name: 'detail',
      component: Detail
    }
  ]
} );
