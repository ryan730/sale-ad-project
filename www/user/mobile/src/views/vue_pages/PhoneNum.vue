<template lang="jade">
  #phone-num
    HeaderIndex( :header='header', :title='title' )
    .content
      .new-phone
        span 新手机号
        input( type="number" placeholder="请输入新手机号" )
      .code
        input( type="text" placeholder="请输入验证码" )
        span 获取验证码
      .confirm 确认
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'phoneNum',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '输入手机号'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #phone-num
    background: #F4F5FB
    .content
      padding-top: $px2rem( 40px )
      .new-phone
      .code
        display: flex
        justify-content: space-between;
        background: #fff
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        margin-bottom: $px2rem( 40px )
        padding-left: $px2rem( 30px )
        font-size: $px2rem( 32px )
      .new-phone
        input
          width: $px2rem( 560px )
          padding-right: $px2rem( 30px )
          text-align: right
      .code
        margin-bottom: 0
        padding-right: $px2rem( 30px )
        color: #444B9C
        input
          border: 0
      .confirm
        background: #fff
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        margin-top: $px2rem( 60px )
        color: #2D316C
        font-size: $px2rem( 36px )
        text-align: center
</style>