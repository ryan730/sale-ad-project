export default {
  changeMoveout( { commit }, options ) {
    commit( 'changeMoveout', options );
  },

  changeCartNum( { commit }, options ) {
    commit( 'changeCartnum', {
      cartNum: options.num
    } );
  },

  changeCartItems( { commit }, options ) {
    commit( 'changeCartItems', options );
  }
};
