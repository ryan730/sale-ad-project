/**
 * Created by ryan.zhu on 2017/12/17.
 　......(\_/)
 　　......( '_')
 　　..../"NOBUG"\======░ ▒▓▓█D
 　　/"""""""""""""""""""\
 　　\_@_@_@_@_@_@_@/
 */
/**
 * Created by ryan.zhu on 2017/11/7.
 　......(\_/)
 　　......( '_')
 　　..../"NOBUG"\======░ ▒▓▓█D
 　　/"""""""""""""""""""\
 　　\_@_@_@_@_@_@_@/
 */
import Vue from 'vue';
import Router from 'vue-router';

import Index from 'vpages/Index.vue';
import Login from 'vpages/Login.vue';
import List from 'vpages/List.vue';
import ShoppingCart from 'vpages/ShoppingCart.vue';
import PayInLine from 'vpages/PayInLine.vue';
import Success from 'vpages/Success.vue';
import ConfirmOrder from 'vpages/ConfirmOrder.vue';
import Details from 'vpages/Details.vue';
import Information from 'vpages/Information.vue';
import Personal from 'vpages/Personal.vue';

Vue.use(Router);

//一级页
const home = r => require.ensure([], () => r(require('@/pages/page-home')), 'home');
const marketing = r => require.ensure([], () => r(require('@/pages/page-marketing')), 'marketing');
const customer = r => require.ensure([], () => r(require('@/pages/page-customer')), 'customer');
const stocks = r => require.ensure([], () => r(require('@/pages/page-stocks')), 'stocks');
const settings = r => require.ensure([], () => r(require('@/pages/page-settings')), 'settings');
const hoppingCart = r => require.ensure([], () => r(require('@/pages/page-hoppingCart')), 'hoppingCart');
const order = r => require.ensure([], () => r(require('@/pages/page-order')), 'order');

//二级页
const homeDetails = r => require.ensure([], () => r(require('@/pages/page-home/page-home-details')), 'homeDetails');
const pageHomeList = r => require.ensure([], () => r(require('@/pages/page-home/page-home-list')), 'pageHomeList');

const customerList = r => require.ensure([], () => r(require('@/pages/page-customer/page-customer-list')), 'customerList');
const customerDetails = r => require.ensure([], () => r(require('@/pages/page-customer/page-customer-details')), 'customerDetails');
const customerCreater = r => require.ensure([], () => r(require('@/pages/page-customer/page-customer-creater')), 'customerCreater');

const requisitionList = r => require.ensure([], () => r(require('@/pages/page-requisition/page-requisition-list')), 'requisitionList');
const requisitionDetails = r => require.ensure([], () => r(require('@/pages/page-requisition/page-requisition-details')), 'requisitionDetails');
const requisitionCreater = r => require.ensure([], () => r(require('@/pages/page-requisition/page-requisition-creater')), 'requisitionCreater');

const stocksList = r => require.ensure([], () => r(require('@/pages/page-stocks/page-stocks-list')), 'stocksList');
const stocksIn = r => require.ensure([], () => r(require('@/pages/page-stocks/page-stocks-in')), 'stocksIn');
const stocksOut = r => require.ensure([], () => r(require('@/pages/page-stocks/page-stocks-out')), 'stocksOut');

const marketingList = r => require.ensure([], () => r(require('@/pages/page-marketing/page-marketing-list')), 'marketingList');
const marketingDetails = r => require.ensure([], () => r(require('@/pages/page-marketing/page-marketing-details')), 'marketingDetails ');


const routes = [
    {
        path: '/index',
        name: 'emp-index',
        component: Index
    },
    {
        path: '/login',
        name: 'emp-login',
        component: Login
    },
    {
        path: '/list/:id',
        name: 'emp-list',
        component: List
    },
    {
        path: '/detail/:id',
        name: 'emp-detail',
        component: Details,
        meta: ['首页', '购买红酒'],
        props: true
    },
    {
        path: '/cart',
        name: 'emp-cart',
        component: ShoppingCart
    },
    {
        path: '/confirm',
        name: 'emp-confirm',
        component: ConfirmOrder
    },
    {
        path: '/pay',
        name: 'emp-pay',
        component: PayInLine
    },
    {
        path: '/success/:type',
        name: 'emp-success',
        component: Success,
        props: true
    },
    {
        path: '/information/:type',
        name: 'emp-information',
        component: Information,
        props: true
    },
    {
        path: '/personal/:type',
        name: 'emp-personal',
        component: Personal,
        props: true
    }
].concat([
    {
        path: '/home',
        component: home,
        name: 'pub-home',
        props: (route) => ({query: route.query.q}),
        children: [
            {
                path: '',
                component: pageHomeList,
                name: 'pub-home',
                meta: [],
            },
            {
                path: 'list/:id',
                component: pageHomeList,
                name: 'pub-home',
                meta: []
            }]
    },
    {
        path: '/home/details/1010',
        component: homeDetails,
        name: 'pub-home',
        meta: [{name: '首页', toPath: '/home/list/1010'}, {name: '口子窖', toPath: ''}]
    },
    {
        path: '/home/details/1020',
        component: homeDetails,
        name: 'pub-home',
        meta: [{name: '首页', toPath: '/home/list/1020'}, {name: '香格里拉', toPath: ''}]
    },
    {
        path: '/home/details/1030',
        component: homeDetails,
        name: 'pub-home',
        meta: [{name: '首页', toPath: '/home/list/1030'}, {name: '土特产', toPath: ''}]
    },
    {
        path: '/marketing/list',
        component: marketingList,
        name: 'pub-marketing',
        meta: [{name: '销售管理', toPath: '/marketing/list'}, {name: '销售台账', toPath: ''}]
    },
    {
        path: '/marketing/details',
        component: marketingDetails,
        name: 'pub-marketing',
        meta: [{name: '销售管理', toPath: '/marketing/list'}, {name: '销售台账', toPath: '/marketing/list'}, {
            name: '订单详情',
            toPath: ''
        }]
    },
    {
        path: '/customer/list',
        component: customerList,
        name: 'pub-customer',
        meta: [{name: '客户管理', toPath: '/customer/list'}, {name: '客户列表', toPath: ''}]
    },
    {
        path: '/customer/creater',
        component: customerCreater,
        name: 'pub-customer',
        meta: [{name: '客户管理', toPath: '/customer/list'}, {name: '创建客户', toPath: ''}]
    },
    {
        path: '/customer/details',
        component: customerDetails,
        name: 'pub-customer',
        meta: [{name: '客户管理', toPath: '/customer/list'}, {name: '客户列表', toPath: '/customer/list'}, {
            name: '列表详情',
            toPath: ''
        }]
    },
    {
        path: '/stocks/list',
        component: stocksList,
        name: 'pub-stocks',
        meta: [{name: '库存管理', toPath: '/stocks/list'}, {name: '库存明细', toPath: '/stocks/list'}]
    },
    {
        path: '/stocks/in',
        component: stocksIn,
        name: 'pub-stocks',
        meta: [{name: '库存管理', toPath: '/stocks/list'}, {name: '入库流水', toPath: '/stocks/in'}]
    },
    {
        path: '/stocks/out',
        component: stocksOut,
        name: 'pub-stocks',
        meta: [{name: '库存管理', toPath: '/stocks/list'}, {name: '出库流水', toPath: '/stocks/out'}]
    },
    {
        path: '/requisition/list',
        component: requisitionList,
        name: 'pub-requisition',
        meta: [{name: '领料申请', toPath: '/requisition/list'}, {name: '申请列表', toPath: ''}]
    },
    {
        path: '/requisition/creater',
        component: requisitionCreater,
        name: 'pub-requisition',
        meta: [{name: '领料申请', toPath: '/requisition/list'}, {name: '新建申请', toPath: ''}]
    },
    {
        path: '/requisition/details',
        component: requisitionDetails,
        name: 'pub-requisition',
        meta: [{name: '领料申请', toPath: '/requisition/list'}, {name: '申请列表', toPath: '/customer/list'}, {
            name: '申请详情',
            toPath: ''
        }]
    },
    {
        path: '/hoppingCart',
        component: hoppingCart,
        name: 'pub-hoppingCart',
        meta: [{name: '购物车', toPath: ''}]
    },
    {
        path: '/settings',
        component: settings,
        name: 'pub-settings',
        meta: [{name: '个人设置', toPath: ''}]
    },
    {
        path: '/order',
        component: order,
        name: 'pub-order',
        meta: [{name: '我的订单', toPath: ''}]
    },
    {path: '/home', redirect: '/home/list/1010'},
    {path: '/customer', redirect: '/customer/list'},
    {path: '/marketing', redirect: '/marketing/list'},
    {path: '/requisition', redirect: '/requisition/list'},
    {path: '/stocks', redirect: '/stocks/list'},
    {path: '/*', redirect: '/index'}
])


const router = new Router({
    routes,
    scrollBehavior() {
        return {
            x: 0,
            y: 0
        }
    },
    strict: process.env.NODE_ENV !== 'production',
});
router.beforeEach((to, from, next) => {
    //console.log('每次都调用!!',to, from, next);
    next();
});
export default router
