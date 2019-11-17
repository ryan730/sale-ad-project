<template lang="jade">
  #success
    HeaderIndex( :header='header', :title='title' )
    .content
      .success
        span.icon 支付完成
        span.mess 请您耐心等候，商品将尽快送到您的手中…
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'preferences',
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

  #success
    .content
      .success
        display: flex
        flex-direction: column
        align-items: center
        justify-content: center;
        height: 100%
        .icon
          background-image: url( '~images/success.png' )
          background-repeat: no-repeat
          background-position: center center
          background-size: contain
          width: auto
          height: $px2rem( 108px )
          padding-top: $px2rem( 200px )
          color: #70C216
          text-align: center
          font-size: $px2rem( 40px )
        .mess
          margin-top: $px2rem( 96px )  
          font-size: $px2rem( 28px )
          color: #999
</style>