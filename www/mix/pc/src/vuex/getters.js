export default {
  // todo: 获取用户登录信息
  getUser( state ) {
    let user = JSON.parse( window.sessionStorage.getItem( 'user' ) );

    state.user = user || state.user;
    return state.user;
  },

  // todo：获取购物车中物品的个数
  getCartNum( state ) {
    return state.cartNum;
  },

  // todo：获取购物车中物品的内容
  getCartItems( state ) {
    return state.cartItems;
  },

  // todo：获取订单信息内容
  getOrderInfo( state ) {
    return state.orderInfo;
  },

  // todo：获取收货地址列表内容
  getAddress( state ) {
    return state.address;
  },

  // todo: 获取提交订单后的数据
  getCommitCartInfo( state ) {
    return state.commitCartInfo;
  },

  // todo: 获取去支付时的订单信息
  getPayOrder( state ) {
    return state.payOrder;
  }
};
