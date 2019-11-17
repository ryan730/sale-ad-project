<template lang="jade">
  header.header
    span.title 久隆商贸欢迎您
    ul.info
      li
        span 张丽丽
      li
        router-link.my-order( to="/personal" )
          span 我的订单
      li
        router-link( :to="{path: '/cart'}" )
          span 购物车
        em {{cartNum}}
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Head',
  computed: {
    ...mapState( {
      cartNum: state => state.cartNum
    } )
  }
};
</script>

<style lang="stylus" scoped>
  .header
    position: relative
    display flex
    align-items center
    justify-content space-between
    background: #000
    height: 40px
    padding-left 310px
    padding-right 204px
    font-size: 14px
    .title
      color: #ffffff
    .info
      display: flex
      color: #ffffff
      li
        padding: 0 39px
        border-right 1px solid #808080
        &:first-child
          background: url( '~images/down.png' ) no-repeat 85px center
        &:last-child
          position: relative
          border-right 0
          em
            background: #ff2a44
            position: absolute
            top: -5px
            right: 30px
            width: 17px
            height: 17px
            line-height: 17px
            border-radius 10px
            text-align: center
            color: #ffffff
            font-size 12px
        span
          cursor: pointer
          color: #ffffff
</style>
