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
  getCustomerReceivingAddr: `${WEBSITE}/api/customer/getCustomerReceivingAddr`,

  // todo: 提交购物车
  commitCart: `${WEBSITE}/api/shoppingCart/commitCart`
};
