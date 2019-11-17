export default {
  changeMoveout( state, options ) {
    state.moveOut = options.moveOut;
  },

  changeCartnum( state, options ) {
    state.cartNum = options.cartNum;
  },

  changeCartItems( state, options ) {
    state.cartItems = options.slice();
  }
};
