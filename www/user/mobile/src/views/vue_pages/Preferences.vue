<template lang="jade">
  #preferences
    HeaderIndex( :header='header', :title='title' )
    .content
      .set-img
        span 头像设置
        router-link.img( :to="{path: '/image'}" )
          img( :src="src" )
      .account
        span 帐户名
        span xxxxxx
      .nickname
        span 昵称
        span xxxxx
      .sex
        span 性别
        span.status 保密
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
      title: '设置',
      src: 'images/person_def.png'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #preferences
    background: #F4F5FB
    .content
      padding-top: $px2rem( 40px )
      div
        background: #fff
        display: flex
        justify-content: space-between
        align-items: center
        padding: 0 $px2rem( 30px )
        font-size: $px2rem( 32px )
        color: #666
      .set-img
        width: $px2rem( 750px )
        height: $px2rem( 142px )
        line-height: $px2rem( 142px )
        margin-bottom: $px2rem( 20px )
        .img
          &:after
            content: '>'
            margin-left: $px2rem( 26px )
            color: #E8E9F1
            font-size: $px2rem( 36px )
          img
            vertical-align: middle
            width: $px2rem( 80px )
            height: auto
      .account
      .nickname
      .sex
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        border-bottom: 1px solid #F0F3F5
      .sex
        .status
          &:after
            content: '>'
            margin-left: $px2rem( 26px )
            color: #E8E9F1
            font-size: $px2rem( 36px )
</style>