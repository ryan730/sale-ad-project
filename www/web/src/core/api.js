import URLS from '@/config/urls';
import fetch from './fetch';

// ----------------------- 公众功能 ------------------------
// todo: 读取购物车信息
export const fetchCart = ( id ) => fetch( {
  url: URLS.CARTLIST,
  data: {
    userID: id
  }
} );

// todo: 登录
export const login = ( params ) => fetch( {
  url: URLS.login,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 登出功能
export const logout = ( params ) => fetch( {
  url: URLS.logout,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 注册
export const finishRegisterByMobile = ( params ) => fetch( {
  url: URLS.finishRegisterByMobile,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 加入购物车功能
export const addToCart = ( params ) => fetch( {
  url: URLS.ADDTOCART,
  method: 'post',
  type: 'form',
  data: params.data
} );

// todo: 商品列表
export const list = ( params ) => fetch( {
  url: URLS.LIST,
  data: params.data
} );

// todo: 获取 detail 页面内容
export const getCommodityChannelByID = ( params ) => fetch( {
  url: URLS.getCommodityChannelByID,
  data: params.data
} );

// todo: detail 页面中添加到购物车功能
export const addCommodityToCart = ( params ) => fetch( {
  url: URLS.addCommodityToCart,
  method: 'post',
  type: 'form',
  data: params.data
} );

// todo: 购物车中删除条目功能
export const delCommodity = ( params ) => fetch( {
  url: URLS.delCommodity,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 购物车中每修改一次数量都要向后端记录一下
export const changeCommodityNum = ( params ) => fetch( {
  url: URLS.changeCommodityNum,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 购物车中的立即结算功能
export const commitCart = ( params ) => fetch( {
  url: params.url,
  data: params.data,
  method: 'post',
  type: 'json'
} );

// todo: 新增收货地址
export const addReceivingAddr = ( params ) => fetch( {
  url: URLS.addReceivingAddr,
  data: params.data,
  method: 'post',
  type: 'json'
} );

// todo: 新增上门门店地址
export const getAllShop = () => fetch( {
  url: URLS.allShopadd,
  method: 'get',
  type: 'json'
} );

// todo: 获取用户的收货地址
export const getCustomerReceivingAddr = ( params ) => fetch( {
  url: URLS.getCustomerReceivingAddr,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 购物车中“去支付”时，生成订单
export const createOrder = ( params ) => fetch( {
  url: URLS.createOrder,
  data: params.data,
  method: 'post',
  type: 'json'
} );

// todo: 支付页面的支付功能
export const pay = ( params ) => fetch( {
  url: URLS.pay,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 获取订单信息
export const getOrder = ( params ) => fetch( {
  url: URLS.getOrder,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 获取客户订单，包括客户自己下单及销售代为下单的所有订单
export const getCustomerOrder = ( params ) => fetch( {
  url: URLS.getCustomerOrder,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 设置用户昵称与性别
export const setUserNickName = ( params ) => fetch( {
  url: URLS.setUserNickName,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 上传用户头像
export const uploadUserHeadPic = ( params ) => fetch( {
  url: URLS.uploadUserHeadPic,
  data: params.data,
  method: 'post',
  type: 'image'
} );

// todo: 修改密码
export const modifyPwd = ( params ) => fetch( {
  url: URLS.modifyPwd,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 修改手机号
export const changeMobile = ( params ) => fetch( {
  url: URLS.changeMobile,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// todo: 返回手机验证码
export const sendMobileVerifyCode = ( params ) => fetch( {
  url: URLS.sendMobileVerifyCode,
  data: params.data,
  method: 'post',
  type: 'form'
} );

// ----------------------- 店员功能 ------------------------
