export default {
  // todo：修改购物车中物品的个数
  changeCartNum( { commit }, options ) {
    commit( 'changeCartNum', options );
  },

  // todo：修改购物车中物品的内容
  changeCartItems( { commit }, options ) {
    commit( 'changeCartItems', options );
  },

  // todo: 更新提交订单后的数据
  changeCommitCartInfo( { commit }, options ) {
    commit( 'changeCommitCartInfo', options );
  },

  // todo：修改订单信息
  changeOrderInfo( { commit }, options ) {
    commit( 'changeOrderInfo', options );
  },

  // todo: 更新去支付后的订单的信息
  changePayOrder( { commit }, options ) {
    commit( 'changePayOrder', options );
  }
};
