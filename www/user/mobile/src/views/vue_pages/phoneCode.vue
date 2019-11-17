<template lang="jade">
  #phone-code
    HeaderIndex( :header='header', :title='title' )
    .content
      .phone
        span 原手机号
        input( type="number" placeholder="请输入手机号码" )
      .code
        input( type="text" placeholder="请输入验证码" )
        span 获取验证码
      .next 下一步
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'phoneCode',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '获取验证码'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #phone-code
    background: #F4F5FB
    .content
      padding-top: $px2rem( 40px )
      .phone
      .code
        background: #fff
        display: flex
        justify-content: space-between;
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        margin-bottom: $px2rem( 40px )
        padding-left: $px2rem( 30px )
        font-size: $px2rem( 32px )
      .phone
        input
          width: $px2rem( 560px )
          padding-right: $px2rem( 30px )
          text-align: right
      .code
        padding-right: $px2rem( 30px )
        color: #444B9C
        .time
          color: #ccc
        input
          border: 0
      .next
        background: #fff
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        margin-top: $px2rem( 60px )
        color: #2D316C
        font-size: $px2rem( 36px )
        text-align: center
</style>