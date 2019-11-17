<template lang="jade">
  #add-addr
    HeaderIndex( :header='header', :title='title' )
    .content
      ul
        li
          span 姓名
          input( type="text" placeholder="填写收货人姓名" )
        li
          span 收货人手机号
          input( type="number" placeholder="填写收货人手机号" )
        li
          span 所在地域
          select.area
            option( value="" ) 北京
        li
          span 详细地址
          textarea.addr( placeholder="填写收货人详细地址" )
      .save 保存收货人信息
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'add_addr',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '新增收货地址'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #add-addr
    width: 100%
    .content
      padding: $px2rem( 30px )
      font-size: $px2rem( 30px );
      color: #666666;
      ul
        li
          margin-bottom: $px2rem( 20px )
          span
            display block
            margin-bottom: $px2rem( 10px )
          input
          select
          textarea
            width: $px2rem( 690px )
          input
          select
            height: $px2rem( 96px )
            border: 1px solid #C5C6D6
            padding-left: 20px
          select
            background: #fff
          textarea
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