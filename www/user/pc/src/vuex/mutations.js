export default {
  changeCartNum( state, options ) {
    state.cartNum = options.num;
  },

  changeCartItems( state, options ) {
    state.cartItems = options.slice();
  },

  changeOrderInfo( state, options ) {
    state.orderInfo = options.slice();
  }
};
