<template lang="jade">
  #admin-addr
    HeaderIndex( :header='header', :title='title' )
    .content
      ul
        li( v-for="item in 5" )
          span.curr
          .title
            span.name xxxx
            span.phone 12344556777
          .info xxxxxxxxxxx
          .opear
            span.addr
              input( type="radio" name="def" )
              span 默认地址
            span
              span.modify 修改
              span.del 删除
    FooterBar( :type="addr" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import FooterBar from '@/modules/footer.vue';

export default {
  name: 'adminAddr',
  components: {
    HeaderIndex,
    FooterBar
  },
  data() {
    return {
      header: 'other',
      title: '收货地址',
      addr: 'addr'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #admin-addr
    width: 100%
    .content
      padding: 0 $px2rem( 30px )
      li
        position: relative
        background: #F4F5FB
        border: 2px solid #2D316C
        padding: $px2rem( 30px )
        margin-bottom: $px2rem( 20px )
        &:last-child
          margin-bottom: 0
        .curr
          position: absolute
          left: 0
          top: 0
          background-image: url( '~images/curr.png' )
          background-repeat: no-repeat
          background-size: contain
          width: $px2rem( 48px )
          height: $px2rem( 48px )
        .title
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: $px2rem( 20px )
          .name
            font-size: $px2rem( 36px )
            font-weight: bold
            color: #333333;
          .phone
            font-size: $px2rem( 30px )
            color: #666666
        .info
          word-break: break-all
          padding-bottom: $px2rem( 22px )
          margin-bottom: $px2rem( 26px )
          border-bottom: 1px solid #fff
        .opear
          display: flex
          justify-content: space-between
          align-items: center
          color: #2D316C
          font-size: $px2rem( 30px )
          .addr
            input
            span
              display: inline-block
              vertical-align: middle
            input
              margin-right: $px2rem( 14px )
          .modify
            display: inline-block
            padding-right: $px2rem( 30px )
            border-right: 1px solid #ccc
          .del
            margin-left: $px2rem( 20px )
</style>