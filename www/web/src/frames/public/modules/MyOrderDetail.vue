<template lang="jade">
  #my-order-detail
    h3.title 
      span 订单详情
    section.order-info
      .title 订单信息
      .info
        .status
          span.order-num 订单号 {{addr.orderID}}
          span.st
            | 订单状态：
            i( v-if="!!addr.status.payTime" ) 已支付
            i( v-else ) 待支付
        address.addr
          .addr-info
            .title 收货信息
            ul
              li
                span 收货人
                span {{addr.receivingAddr.contacts}}
              li
                span 收货地址
                span {{addr.receivingAddr.receivingAddr}}
              li
                span 联系电话
                span {{addr.receivingAddr.mobile}}
          .pay-info
            .title 支付信息
            ul
              li
                span 支付方式
                span {{addr.status.payTypeName}}
              li
                span 支付金额
                span {{addr.status.amount}}元
              li
                span 付款时间
                span {{addr.status.payTime}}
    section.order-cont
      .title 订单内容
      main.cont
        nav.nav
          span 商品
          span 单价
          span 数量
          span 小计
        section
          ul
            li( v-for="item in content" )
              .item
                span
                  img( :src="item.commodity.pic" )
                  span.name {{item.commodity.commodityName}}
                span.price
                  span
                    | 指导价：
                    i ￥{{item.commodity.price}}
                  span 会员价：￥{{item.commodity.commodityChannel || 0}}
                span {{item.num}}
                span ￥{{item.price}}
              CouponOrder( v-if="item.gifts.length > 0" )
        CouponGift( v-if="result.gifts.length > 0" )
        section.amount( v-if="addr.status.payTime !== ''" )
          .mount
            span 
              | 共计
              em {{result.commodityNum}}
              | 件商品
            span 总计：￥{{result.activityAmount}}
          .discount
            span 优惠：￥{{result.orderDiscounts}}
            span 商品总价：￥{{result.realPrice}}
          .pay( @click="gotoPay( addr.orderID )" ) 去支付
</template>

<script>
import CouponGift from './CouponGift.vue';
import CouponOrder from './CouponOrder.vue';
import urls from '@/config/urls';
import { getOrder } from '@/core/api';

export default {
  name: 'MyOrderDetail',
  components: {
    CouponGift,
    CouponOrder
  },
  data() {
    return {
      addr: {
        status: {
          payTime: '',
        },
        receivingAddr: {
          contacts: '',
          mobile: ''
        }
      },
      content: [],
      result: {
        gifts: []
      }
    }
  },
  mounted() {
    getOrder( {
      data: {
        orderID: this.getOrderID()
      }
    } ).then( data => {
      console.log( data );

      this.result = data.result;
      this.result.orderContents.forEach( order => {
        order.commodity.pic = urls.BaseURL + order.commodity.pic;
      } );

      this.addr = {
        orderID: this.result.orderID,
        status: this.result.payInfo === null
          ? {}
          : this.result.payInfo,
        receivingAddr: this.result.orderReceivingAddr.receivingAddr
      };
      
      this.addr.status.payTime = this.addr.status.payTime !== '' 
        ? new Date( this.addr.status.payTime ).toLocaleDateString().replace( /\//g, '-' )
        : false;

      this.content = this.result.orderContents;
    } );
  },
  methods: {
    gotoPay( id ) {
      this.$store.dispatch( 'pubStore/changePayOrder', {
        orderID: id
      } ).then( () => {
        this.$router.push( {
          path: '/pay'
        } );
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  #my-order-detail
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
    .order-info
      margin-top 18px
      margin-bottom 20px
      .title
        border 0
        margin-bottom 20px
        padding-bottom 0
        font-weight bold
      .info
        background #F4F5FB
        padding 0 20px
        .status
          display flex
          justify-content space-between
          align-items center
          height 40px
          border-bottom 1px solid #fff
          font-size 14px
          i
            color #444B9C
        .addr
          display flex
          .addr-info
          .pay-info
            padding 20px 0
            flex-basis 50%
            .title
              margin-bottom 10px
            ul
              font-size 14px
              color #666
              li
                margin-bottom 10px
          .addr-info
            li
              span
                display inline-block
                &:first-child
                  width 77px
          .pay-info
            border-left 1px solid #fff
            padding-left 20px
            li
              span
                color #333
                margin-right 15px
                &:first-child
                  color #666
    .order-cont
      .title
        border 0
        padding-bottom 20px
        font-weight bold
      .cont
        .nav
          display grid
          background #F4F5FB
          grid-template-columns 2fr 1fr 1fr 1fr
          align-items center
          justify-items center
          height 40px
          font-size 14px
          color #999
        section
          margin 20px 0
          ul
            li
              border-bottom 1px solid #F0F3F5
              .item
                display grid
                grid-template-columns 2fr 1fr 1fr 1fr
                align-items center
                justify-items center
                font-size 14px
                color #333
                img
                  width 180px
                  height 180px
                  margin-right 10px
                span
                  &:first-child
                    display flex
                    align-items center
                .price
                  span
                    display block
                    &:first-child
                      em
                        text-decoration line-through
        .amount
          overflow hidden
          .mount
            display flex
            background #F4F5FB
            align-items center
            justify-content space-between
            height 50px
            margin-top 30px
            padding 0 30px
            font-size 14px
            color #333
            em
              color red
          .discount
            margin-top 10px
            padding-right 30px
            span
              display block
              text-align right
              font-size 14px
              color #999
          .pay
            float right
            margin-top 20px
            background #2D316C
            width 158px
            height 50px
            line-height 50px
            border-radius 3px
            text-align center
            font-size 16px
            color #fff
            cursor pointer
</style>