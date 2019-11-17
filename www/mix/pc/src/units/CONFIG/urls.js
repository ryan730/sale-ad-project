const WEBSITE = 'http://114.215.18.58:8080/sale';

export default {
  BaseURL: `${WEBSITE}`,

  // todo: 通过商品类型获取商品列表
  LIST: `${WEBSITE}/api/commodity/getCommodityByType`,

  // todo: 获取购物车列表
  CARTLIST: `${WEBSITE}/api/shoppingCart/getCartList`,

  // todo: 添加商品到购物车
  ADDTOCART: `${WEBSITE}/api/shoppingCart/addCommodityToCart`,
  getCommodityChannelByID: `${WEBSITE}/api/commodity/getCommodityChannelByID`,
  addCommodityToCart: `${WEBSITE}/api/shoppingCart/addCommodityToCart`,

  // todo: 修改商品数量
  changeCommodityNum: `${WEBSITE}/api/shoppingCart/changeCommodityNum`,

  // todo: 商品从购物车里删除
  delCommodity: `${WEBSITE}/api/shoppingCart/delCommodity`,

  // todo: 获取收货地址
  getCustomerReceivingAddr: `${WEBSITE}/api/user/getUserReceivingAddr`,

  // todo: 添加收货地址
  addReceivingAddr: `${WEBSITE}/api/user/addReceivingAddr`,

  // todo: 提交购物车
  commitCart: `${WEBSITE}/api/shoppingCart/commitCart`,

  createOrder: `${WEBSITE}/api/saleOrder/createOrder`,

  // todo: 获取订单信息
  getOrder: `${WEBSITE}/api/saleOrder/getOrder`,

  // todo: 获取手机验证码
  sendMobileVerifyCode: `${WEBSITE}/api/user/sendMobileVerifyCode`,

  // todo: 用户登录
  login: `${WEBSITE}/api/user/login`,

  // todo: 用户退出
  logout: `${WEBSITE}/api/user/logout`,

  // todo: 注册用户
  finishRegisterByMobile: `${WEBSITE}/api/user/finishRegisterByMobile`,

  // todo: 支付
  pay: `${WEBSITE}/api/pay/pay`
};
