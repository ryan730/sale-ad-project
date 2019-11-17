<template lang="jade">
  #detail
    HeaderIndex( :header='header', :title='title' )
    .content
      img.img( :src="src" )
      .info
        h3.title 750ml天籁干红
        .mess
          span 官方指导价：￥8900
          span 商品编号：ECS98899
          span 商品品牌：香格里拉
    FooterBar( :type="detail" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import FooterBar from 'modules/footer.vue';

export default {
  name: 'detail',
  components: {
    HeaderIndex,
    FooterBar
  },
  data() {
    return {
      header: 'other',
      title: '750ml天籁干红',
      detail: 'detail',
      src: 'images/detail.png'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #detail
    .content
      display: flex
      flex-direction: column
      align-items: center
      padding-top: $px2rem( 80px )
      .img
        width: $px2rem( 1000px )
        height: auto
        margin-bottom: $px2rem( 60px )
      .info
        width: 100%
        padding-left: $px2rem( 60px )
        padding-bottom: $px2rem( 80px )
        margin-bottom: $px2rem( 80px )
        border-bottom: 1px solid #F0F3F5
        .title
          margin-bottom: $px2rem( 40px )
          font-size: $px2rem( 52px )
          font-weight: bold
          color: #333
        .mess
          background: #F4F5FB
          padding: $px2rem( 36px 56px )
          font-size: $px2rem( 28px )
          color: #333
          span
            display: block
            margin-bottom: $px2rem( 12px )
</style>