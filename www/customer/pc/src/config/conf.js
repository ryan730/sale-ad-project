/**
 * Created by ryan.zhu on 2017/11/8.
 　......(\_/)
 　　......( '_')
 　　..../"NOBUG"\======░ ▒▓▓█D
 　　/"""""""""""""""""""\
 　　\_@_@_@_@_@_@_@/
 */
export default {
    baseURL:'http://114.215.18.58:8080/sale',
    pages: [
        {
            //icon: 'el-icon-date',
            icon: 'sm-iconfont icon-sm-shouye-xianxing',
            index: '/home',
            title: 'shouye',
            name:'首页',
            isShow:true,
            drillList: [
                {
                    topath: '/home/details/1010',
                    title: 'kouzijiao',
                    name: '口子窖',
                    isShow:false
                },
                {
                    topath: '/home/details/1020',
                    title: 'xianggelila',
                    name: '香格里拉',
                    isShow:false
                },
                {
                    topath: '/home/details/1030',
                    title: 'tutechan',
                    name: '土特产',
                    isShow:false
                },
            ]
        },
        {
            index: '/hoppingCart',
            title: 'gouwuche',
            name: '购物车',
            isShow:false
        },
        {
            icon: 'sm-iconfont icon-sm-danju-xianxing',
            index: '/marketing',
            title: 'xiaoshouguanli',
            name:'销售管理',
            isShow:true,
            sublist: [
                {
                    topath: '/marketing/list',
                    title: 'guanliliebiao',
                    name: '销售台账',
                    isShow:true
                },
                {
                    topath: '/marketing/details',
                    title: 'xiaoshoutaizhang',
                    name: '订单详情',
                    isShow:false
                }
            ]
        },
        {
            icon: 'sm-iconfont icon-sm-jiaosequnti-xianxing',
            index: '/customer',
            title: 'kehuguanli',
            name:'客户管理',
            isShow:true,
            sublist: [
                {
                    topath: '/customer/list',
                    title: 'kehuliebiao',
                    name: '客户列表',
                    isShow:true
                },
                {
                    topath: '/customer/creater',
                    title: 'xinjiankehu',
                    name: '新建客户',
                    isShow:true
                },
                {
                    topath: '/customer/details',
                    title: 'kehuxiangqing',
                    name: '客户详情',
                    isShow:false
                }
            ]

        },
        {
            icon: 'sm-iconfont icon-sm-kucun-xianxing',
            index: '/stocks',
            title: 'kucunguanli',
            name:'库存管理',
            isShow:true,
            sublist: [
                {
                    topath: '/stocks/list',
                    title: 'kucunmingxi',
                    name: '库存明细',
                    isShow:true
                },
                {
                    topath: '/stocks/in',
                    title: 'rukuliushui',
                    name: '入库流水',
                    isShow:true
                },
                {
                    topath: '/stocks/out',
                    title: 'chukuliushui',
                    name: '出库流水',
                    isShow:true
                }
            ]
        },
        {
            icon: 'sm-iconfont icon-sm-kucun-xianxing',
            index: '/requisition',
            title: 'lingliaoshenqing',
            name:'领料申请',
            isShow:true,
            sublist: [
            {
                topath: '/requisition/list',
                title: 'shenqingliebiao',
                name: '申请列表',
                isShow:true
            },
            {
                topath: '/requisition/creater',
                title: 'xinjianshenqing',
                name: '新建申请',
                isShow:true
            },
            {
                topath: '/requisition/details',
                title: 'sheqingxiangqing',
                name: '申请详情',
                isShow:false
            }]
        },
        {
            icon: 'sm-iconfont icon-sm-shezhi-xianxing',
            index: '/settings',
            title: 'gerenshezhi',
            name: '个人设置',
            isShow:true
        },
        {
            icon: 'sm-iconfont icon-sm-kucun-xianxing',
            index: '/order',
            title: 'wodedingdan',
            name:'我的订单',
            isShow:false
        }]
};
