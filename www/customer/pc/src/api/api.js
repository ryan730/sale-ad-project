/**
 * Created by ryan.zhu on 2017/11/23.
 　......(\_/)
 　　......( '_')
 　　..../"NOBUG"\======░ ▒▓▓█D
 　　/"""""""""""""""""""\
 　　\_@_@_@_@_@_@_@/
 */
import fetch from '@/utils/server';

//商品信息======================================================================================================================
//添加商品渠道编码及价格
export const getAllCommodityChannel = data => fetch('/api/commodity/getAllCommodityChannel',data,'GET');

//按类型获取商品信息
export const getCommodityByType = data => fetch('/api/commodity/getCommodityByType',data,'GET');

//获取单个商品信息
export const getCommodityChannelByID = data => fetch('/api/commodity/getCommodityChannelByID',data,'GET');

//删除购物车里的商品
export const delCommodity = data => fetch('/api/commodity/delCommodity',data,'POST');

//==============================================================================================================================

//购物车信息======================================================================================================================
//添加购物车
export const addCommodityToCart = data => fetch('/api/shoppingCart/addCommodityToCart', data, 'POST');

//获取购物车列表
export const getCartList = data => fetch('/api/shoppingCart/getCartList',data,'GET');

//提交购物车
export const commitCart = data => fetch('/api/shoppingCart/commitCart',data,'POST','json');

//==============================================================================================================================
//POST /api/saleOrder/getCustomerOrder
//客户信息
//获取所有客户信息
export const getAllUser = data => fetch('/api/user/getAllUser',data,'POST');

//获取销售订单
export const getSalerOrder = data => fetch('/api/saleOrder/getSalerOrder',data,'POST');

//获取我的客户
export const getMyUserFollow = data => fetch('/api/user/getMyUserFollow',data,'POST');
//==============================================================================================================================
//库存
//获取我的库存
export const getMyStock = data => fetch('/api/stock/getMyStock',data,'POST');

//获取我的入库单
export const getMyInStock = data => fetch('/api/stock/getMyInStock',data,'POST');

//获取我的出库单
export const getMyOutStock = data => fetch('/api/stock/getMyOutStock',data,'POST');

//==============================================================================================================================
//获取客户订单，包括客户自己下单及销售代为下单的所有订单
export const getCustomerOrder = data => fetch('/api/saleOrder/getCustomerOrder',data,'POST');
