<template lang="jade">
  #image
    HeaderIndex( :header='header', :title='title' )
    .content
      img( :src="src" )
      .change-image
        span.album 从相册选择一张
        span.take-pic 拍摄一张
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';

export default {
  name: 'image',
  components: {
    HeaderIndex
  },
  data() {
    return {
      header: 'other',
      title: '设置头像',
      src: 'images/image.png'
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #image
    .content
      img
        width: $px2rem( 750px )
      .change-image
        display: flex
        flex-direction: column
        align-items: center
        text-align: center
        margin-top: $px2rem( 40px )
        span
          width: $px2rem( 680px )
          height: $px2rem( 96px )
          line-height: $px2rem( 96px )
          margin-bottom: $px2rem( 20px )
          border: 1px solid #C5C6D6
          font-size: $px2rem( 32px )
          color: #2D316C
</style>