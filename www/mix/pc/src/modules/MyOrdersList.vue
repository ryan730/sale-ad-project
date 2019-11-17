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
      section( v-for="item in section")
        .title 2017-11-27 订单编号：1234567890
        main
          .item
            .item-cont
              ul
                li( v-for="item in items" )
                  .prod
                    span
                      img( :src="src" )
                      span.name xxxx
                    span 10
                    span ￥1999
                  CouponOrder
              aside.opear
                span 待支付 支付完成
                span
                  i 立即支付
                  i 查看详情
            aside.gift
              CouponGift 
</template>

<script>
import CouponGift from './CouponGift.vue';
import CouponOrder from './CouponOrder.vue';
import codes from '@/units/CONFIG/codes';
import urls from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';

export default {
  name: 'myOrder',
  components: {
    CouponGift,
    CouponOrder
  },
  data() {
    return {
      src: '',
      items: 3,
      section: 2
    };
  },
  mounted() {
    ajax.post( {
      url: urls.getOrder,
      data: {
        orderID: '148a3542d6ce43d397827b3753f44c11'
      },
      success: res => {
        console.log( res );
      }
    } );
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
                      width 180px
                      height 180px
                      border 1px solid red
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