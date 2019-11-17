<template lang="jade">
  #coupon-gift
    .cont
      .gift-title 
        span 订单赠品
      ul
        li( v-for="gift in gifts" )
          span
            img( :src="gift.src" )
            span {{gift.giftID}}
          span x{{gift.num}}
</template>

<script>
export default {
  name: 'CouponGift',
  props: ['gifts']
};
</script>

<style lang="stylus" scoped>
  #coupon-gift
    .cont
      background #FFF7ED 
      .gift-title
        position relative
        background #FFF7ED 
        height 27px
        color #fff
        font-size 16px
        span
          position absolute
          background-image url( '~assets/public/images/icon1.png' ) 
          background-repeat no-repeat
          border 0
          left 10px
          top -5px
          width 92px
          height 32px
          line-height 32px
          text-align center
      ul
        li
          display grid
          grid-template-columns 10fr 1fr
          align-items center
          padding 20px
          font-size 16px
          color #333
          span
            &:first-child
              display flex
              align-items center
          img
            width 180px
            height 180px
            border 1px solid red
            margin-right 20px
</style>