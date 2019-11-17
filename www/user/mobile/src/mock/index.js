import URLS from '@/units/CONFIG/urls.js';

let mock = {};

mock[`${URLS.LIST}`] = {
    code: 0,
    result: [
        {
            pic:'images/detail.png',
            commodityName: '葡萄酒',
            price: '100',
            commodityID: 'c001'
        },
        {
            pic: 'images/detail.png',
            commodityName: '红酒',
            price: '100',
            commodityID: 'c002'
        },
        {
            pic: 'images/detail.png',
            commodityName: '红酒',
            price: '100',
            commodityID: 'c003'
        }
    ]
}

mock[`${URLS.CARTLIST}`] = {
    code: 0,
    result: [
        {
            commodity:{
                pic: 'images/1.png',
                commodityName: '红酒',
                price: '100'
        
            },
            tags:['年份','产地','品牌'],
            num:'8',
            totalAmount:'800'
        },
        {
            commodity: {
                pic: 'images/1.png',
                commodityName: '葡萄酒',
                price: '200'

            },
            tags: ['年份', '产地', '品牌'],
            num: '8',
            totalAmount: '1600'
        }
    ]
}

mock[`${URLS.ADDTOCART}`] = {
    code: 0,
    result: [
        {
            commodity:{
                pic: 'images/1.png',
                commodityName: '红酒',
                price: '100'
        
            },
            tags:['年份','产地','品牌'],
            num:'8',
            totalAmount:'800'
        },
        {
            commodity: {
                pic: 'images/1.png',
                commodityName: '葡萄酒',
                price: '200'

            },
            tags: ['年份', '产地', '品牌'],
            num: '8',
            totalAmount: '1600'
        }
    ]
}

/**
   img( :src="item.pic" )
            span.title {{item.commodityName}}
            span.money {{item.price}}
            span.add( @touchstart="addToCart", :id="item.commodityID" ) 加入购物车
 */

export const transFun = (params) => {
    const { url } = params;
    return { data: mock[`${url}`] };
}