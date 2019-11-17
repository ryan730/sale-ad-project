<template lang="jade">
  #coupon 
    span 多买多送，买六送一
    span [赠品] xxxxxxx
</template>

<script>
export default {
  name: 'CouponOrder'
};
</script>

<style lang="stylus" scoped>
  #coupon
    background #FFF7ED url( '~assets/public/images/discount_icon.png' ) 10px center no-repeat
    height 27px
    line-height 27px
    margin 10px 19px 20px
    padding-left 37px
    font-size 14px
    color #2D316C
    span
      &:last-child
        margin-left 88px
        color #999
</style>