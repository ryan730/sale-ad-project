<template lang="jade">
  #order-commit
    HeaderIndex( :header='header', :title='title' )
    .content
      .success
        .title 订单提交成功
        .time 
          | 请在
          em 1小时59分59秒
          | 内完成支付
      .amount-addr
        .money 应付金额：￥7788
        .addr
          .name xxxx
          p xxxxx
      .paytype
        .title 请选择支付方式
        .weixin.current
          span
        .zhifubao
          span
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'orderCommit',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '在线付款'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #order-commit
    .content
      padding: $px2rem( 30px )
      .success
        display: flex
        flex-direction: column
        justify-content: center;
        width: $px2rem( 690px )
        height: $px2rem( 204px )
        border: 1px solid #F4F5FB
        text-align: center
        .title
          font-weight: bold
          color: #333333
          font-size: $px2rem( 40px )
        .time
          margin-top: $px2rem( 6px )
          font-size: $px2rem( 28px )
          em
            color: #FB596D
      .amount-addr
        background: #F4F5FB
        padding: $px2rem( 24px ) $px2rem( 32px )
        .money
          border-bottom: 1px solid #fff
          padding-bottom: $px2rem( 24px )
          font-size: $px2rem( 28px )
          color: #333
        .addr
          padding-top: $px2rem( 20px )
          font-size: $px2rem( 28px )
          color: #999
          p
            word-break: break-all
      .paytype
        margin-top: $px2rem( 44px )
        .title
          font-weight: bold
          font-size: $px2rem( 36px )
          text-align: center
          color: #333
        .weixin
        .zhifubao
          position: relative
          background-repeat: no-repeat
          background-position: center center
          margin-top: $px2rem( 32px )
          width: $px2rem( 690px )
          height: $px2rem( 160px )
          border: 1px solid #F0F3F5
        .weixin
          background-image: url( '~images/weixin.png' )
        .zhifubao
          background-image: url( '~images/zhifubao.png' )
        .current
          border: 2px solid #2D316C
          span
            position: absolute
            background: url( '~images/curr.png' ) no-repeat
            left: 0
            top: 0
            width: $px2rem( 48px )
            height: $px2rem( 48px )
</style>