<template lang="jade">
  #my-order
    h3.title 
      span 我的订单
    main.main
      nav.nav
        span 商品
        span 数量
        span 合计
        span 状态
        span 操作
      section( v-for="order in orders")
        .title 2017-11-27 订单编号：{{order.orderID}}
        main
          .item
            .item-cont
              ul
                li( v-for="item in order.orderContents" )
                  .prod
                    span
                      img( :src="item.commodity.pic" )
                      span.name {{item.commodity.commodityName}}
                    span {{item.num}}
                    span ￥{{item.price}}
                  CouponOrder( v-if="item.gifts.length > 0" )
              aside.opear
                span( v-if="order.payTime === null" ) 待支付
                span( v-else ) 支付完成
                span
                  i( @click="gotoPay( order )", v-if="order.payTime === null" ) 立即支付
                  i( @click="gotoDetail( order.orderID )" ) 查看详情
            aside.gift( v-if="order.gifts.length > 0" )
              CouponGift( :gifts="order.gifts" ) 
</template>

<script>
  import CouponGift from './CouponGift.vue';
  import CouponOrder from './CouponOrder.vue';
  import urls from '@/config/urls';
  import { 
    getCustomerOrder,
    createOrder
  } from '@/core/api';

  export default {
    name: 'myOrder',
    components: {
      CouponGift,
      CouponOrder
    },
    data() {
      return {
        orders: []
      };
    },
    mounted() {
      getCustomerOrder( {
        data: {
          customerID: this.getUserID()
        }
      } ).then( data => {
        const result = data.result;

        this.orders = result.content;
        this.orders.forEach( order => {
          order.orderContents.forEach( item => {
            item.commodity.pic = urls.BaseURL + item.commodity.pic;
          } )
        } );
      } );
    },
    methods: {
      gotoDetail( id ) {
        this.$store.dispatch( 'pubStore/changePayOrder', {
          orderID: id
        } ).then( () => {
          this.$router.push( {
            path: '/personal/myorder'
          } );
        } );
      },
      gotoPay( info ) {
        this.$store.dispatch( 'pubStore/changePayOrder', info ).then( () => {
          this.$router.push( {
            path: '/pay'
          } );
        } );
      }
    }
  };
</script>

<style lang="stylus" scoped>
  #my-order
    margin-right 240px
    .title
      padding-bottom 10px
      border-bottom 1px solid #F0F3F5
      font-size 16px
      color #333
      span
        display inline-block
        padding-left 6px
        line-height 16px
        border-left 4px solid #2D316C
    .main
      margin-top 30px
      .nav
        display grid
        grid-template-columns 2fr 1fr 1fr 1fr 1fr
        text-align center
        font-size 14px
        color #999
      section
        margin-top 20px
        border-left 1px solid #F0F3F5 
        border-right 1px solid #F0F3F5 
        .title
          background #F4F5FB
          height 40px
          line-height 40px
          border 0
          padding-left 20px
          padding-bottom 0
          font-size 14px
          color #333
        main
          .item
            .item-cont
              display flex
              border-bottom 1px solid #F0F3F5
              ul
                flex-basis 67%
                li
                  border-bottom 1px solid #F0F3F5
                  padding-top 20px
                  &:last-child
                    border-bottom 0
                  .prod
                    display grid
                    grid-template-columns 2fr 1fr 1fr 
                    text-align center
                    align-items center
                    margin-bottom 20px
                    img
                      width 100px
                      height 100px
                      margin-right 20px
                    span
                      &:first-child
                        display flex
                        justify-content center
                        align-items center
              .opear
                display grid
                grid-template-rows 1fr
                grid-template-columns 1fr 1fr
                flex-basis 33%
                span
                  display flex
                  flex-direction column
                  border-left 1px solid #F0F3F5
                  align-items center
                  justify-content center
                  font-size 14px
                  color #999
                  i
                    width 73px
                    height 24px
                    line-height 24px
                    border 1px solid #C5C6D6
                    border-radius 3px
                    margin-bottom 10px
                    text-align center
                    cursor pointer
                    color #444B9C
            .gift
              padding 20px
              border-bottom 1px solid #F0F3F5
</style>