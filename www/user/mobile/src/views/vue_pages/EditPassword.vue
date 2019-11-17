<template lang="jade">
  #edit-password
    HeaderIndex( :header='header', :title='title' )
    .content
      .old-password
        span 原密码
        input( type="password" placeholder="请输入原密码" )
      .forget-password 忘记密码？
      .new-password
        span 新密码
        input( type="password" placeholder="请输入新密码" )
      .confirm-password
        span 确认新密码
        input( type="password" placeholder="请确认新密码" )
      .cancel 注 销
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
      title: '修改密码'
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
      div
        display: flex
        justify-content: space-between;
        background: #fff
        width: $px2rem( 750px )
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        padding-left: $px2rem( 30px )
        font-size: $px2rem( 32px )
      input
        border: 0
        width: $px2rem( 500px )
        padding-right: $px2rem( 30px )
        text-align: right
      .old-password
        margin-bottom: $px2rem( 20px )
      .new-password
        margin-bottom: 0
        border-bottom: 1px solid #F0F3F5
      .forget-password
        background: none
        height: auto
        line-height: normal
        margin-bottom: $px2rem( 40px )
        color: #444B9C
        font-size: $px2rem( 28px )
      .cancel
        display: block
        padding: 0
        margin-top: $px2rem( 80px )
        text-align: center
        color: #2D316C
        font-size: $px2rem( 36px )
</style>