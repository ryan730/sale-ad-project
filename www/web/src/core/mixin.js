import { fetchCart } from '@/core/api';

export default ( Vue ) => Vue.mixin( {
  methods: {
    // todo: 返回用户的 userID
    getUserID() {
      const user = JSON.parse( window.sessionStorage.getItem( 'user' ) );
      return user.userID;
    },

    // todo: 返回订单号
    getOrderID() {
      return this.$store.getters['pubStore/getPayOrder'].orderID;
    },

    // todo: 设置页面右上角中购物车数量
    async fetchCart( id ) {
      const data = await fetchCart( id );

      this.$store.dispatch( 'pubStore/changeCartNum', {
        num: data.result.length
      } );
      this.$store.dispatch( 'pubStore/changeCartItems', data.result );
      return data;
    }
  }
} );
