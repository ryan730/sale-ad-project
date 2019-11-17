export default {
  // todo: 修改用户登录信息
  changeUser( { commit }, options ) {
    commit( 'changeUser', options );
  },

  // todo：修改购物车中物品的个数
  changeCartNum( { commit }, options ) {
    commit( 'changeCartNum', options );
  },

  // todo：修改购物车中物品的内容
  changeCartItems( { commit }, options ) {
    commit( 'changeCartItems', options );
  },

  // todo：修改订单信息
  changeOrderInfo( { commit }, options ) {
    commit( 'changeOrderInfo', options );
  },

  // todo：修改收货地址列表内容
  changeAddress( { commit }, options ) {
    commit( 'changeAddress', options );
  },

  clearAddress( { commit } ) {
    commit( 'clearAddress' );
  },

  // todo: 更新提交订单后的数据
  changeCommitCartInfo( { commit }, options ) {
    commit( 'changeCommitCartInfo', options );
  },

  // todo: 更新去支付后的订单的信息
  changePayOrder( { commit }, options ) {
    commit( 'changePayOrder', options );
  }
};
