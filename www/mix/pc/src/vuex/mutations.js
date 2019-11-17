export default {
  // todo: 修改用户登录信息
  changeUser( state, options ) {
    const session = window.sessionStorage;

    session.setItem( 'user', JSON.stringify( options ) );
    state.user = {
      name: options.name,
      isLogin: options.isLogin
    };
  },

  // todo：修改购物车中物品的个数
  changeCartNum( state, options ) {
    state.cartNum = options.num;
  },

  // todo：修改购物车中物品的内容
  changeCartItems( state, options ) {
    state.cartItems = options.slice();
  },

  // todo：修改订单信息
  changeOrderInfo( state, options ) {
    state.orderInfo = options.slice();
  },

  // todo：修改收货地址列表内容
  changeAddress( state, options ) {
    state.address.push( options );
  },

  clearAddress( state ) {
    state.address = [];
  },

  // todo: 更新提交订单后的数据
  changeCommitCartInfo( state, options ) {
    state.commitCartInfo = options;
  },

  // todo: 更新去支付后的订单的信息
  changePayOrder( state, options ) {
    state.payOrder = options;
  }
};
