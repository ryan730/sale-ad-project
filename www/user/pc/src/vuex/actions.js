export default {
  changeCartNum( { commit }, options ) {
    commit( 'changeCartNum', options );
  },

  changeCartItems( { commit }, options ) {
    commit( 'changeCartItems', options );
  },

  changeOrderInfo( { commit }, options ) {
    commit( 'changeOrderInfo', options );
  }
};
