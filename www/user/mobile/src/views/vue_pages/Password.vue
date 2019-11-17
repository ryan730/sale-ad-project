<template lang="jade">
  #edit-password
    HeaderIndex( :header='header', :title='title' )
    .content
      .new
        span 新密码
        input( type="password" placeholder="请输入新密码" )
      .old
        span 确认新密码
        input( type="password" placeholder="请确认新密码" )
      .confirm 确认
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'editPassword',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '输入新密码'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #edit-password
    background: #F4F5FB
    .content
      padding-top: $px2rem( 40px )
      .new
      .old
        display: flex
        background: #fff
        justify-content: space-between
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        border-bottom: 1px solid #F0F3F5
        padding-left: $px2rem( 30px )
        font-size: $px2rem( 32px )
        color: #666666
        input
          width: $px2rem( 540px )
          padding-right: $px2rem( 30px )
          border: 0
          text-align: right
          color: #999999
      .confirm
        background: #fff
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        margin-top: $px2rem( 100px )
        text-align: center
        font-size: $px2rem( 36px )
        color: #2D316C
</style>