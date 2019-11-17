<template lang="jade">
  #edit-addr
    HeaderIndex( :header='header', :title='title' )
    .content
      ul
        li
          span 所在地域
          select.area
            option( value="" ) 北京
        li
          span 详细地址
          textarea.addr
      .save 保存收货人信息
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'edit_addr',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '编辑收货地址'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #edit-addr
    .content
      padding: 30px
      font-size: $px2rem( 30px );
      color: #666666;
      ul
        li
          margin-bottom: $px2rem( 20px )
          span
            display block
            margin-bottom: $px2rem( 10px )
          select
            background: #fff
            width: $px2rem( 690px )
            height: $px2rem( 96px )
            border: 1px solid #C5C6D6
            padding-left: 20px
          textarea
            width: $px2rem( 690px )
            height: $px2rem( 182px )
            border: 2px solid #61659A
            padding: 20px
    .save
      background: #2D316C
      width: $px2rem( 690px )
      height: $px2rem( 96px )
      line-height: $px2rem( 96px )
      border-radius: 5px
      font-size: $px2rem( 32px );
      color: #ffffff;
      text-align: center
</style>