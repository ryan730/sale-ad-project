export default {
  // todo：修改购物车中物品的个数
  changeCartNum( state, options ) {
    state.cartNum = options.num;
  },

  // todo：修改购物车中物品的内容
  changeCartItems( state, options ) {
    state.cartItems = options.slice();
  },

  // todo: 更新提交订单后的数据
  changeCommitCartInfo( state, options ) {
    state.commitCartInfo = options;
  },

  // todo：修改订单信息
  changeOrderInfo( state, options ) {
    state.orderInfo = options.slice();
  },

  // todo: 更新去支付后的订单的信息
  changePayOrder( state, options ) {
    state.payOrder = options;
  }
};
