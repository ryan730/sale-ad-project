<template lang="jade">
  #my-order-detail
    h3.title 
      span 订单详情
    section.order-info
      .title 订单信息
      .info
        .status
          span.order-num 订单号 DFD897987907
          span.st
            | 订单状态：
            i 待支付
        address.addr
          .addr-info
            .title 收货信息
            ul
              li
                span 收货人
                span xxxx
              li
                span 收货地址
                span sdfafafasfas
              li
                span 联系电话
                span 12313123
          .pay-info
            .title 支付信息
            ul
              li
                span 支付方式
                span 微信支付
              li
                span 支付金额
                span 478元
              li
                span 付款时间
                span 2017-11-10
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
            li
              .item
                span
                  img( src="" )
                  span.name asdfas
                span.price
                  span
                    | 指导价：
                    i ￥980
                  span 会员价：￥987
                span 10
                span ￥808
              CouponOrder
        CouponGift
        section.amount
          .mount
            span 
              | 共计
              em 3
              | 件商品
            span 总计：￥7889
          .discount
            span 优惠：￥788
            span 运费：￥89
            span 商品总价：￥899
          .pay 去支付
</template>

<script>
import CouponGift from './CouponGift.vue';
import CouponOrder from './CouponOrder.vue';

export default {
  name: 'MyOrderDetail',
  components: {
    CouponGift,
    CouponOrder
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
</style>