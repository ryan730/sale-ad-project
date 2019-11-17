<template lang="jade">
  .swipe
    mt-swipe.carousel( :auto="4000" )
      mt-swipe-item
        router-link( to="/list/1010" )
          img.kzj( src="~images/kzj.png" )
      mt-swipe-item
        router-link( to="/list/1020" )
          img.xgla( src="~images/xgla.png" )
      mt-swipe-item
        router-link( to="/list/1030" )
          img.ttc( src="~images/ttc.png" )
</template>

<script>
export default {
  name: 'carousel',
  data() {
    return {
      value: 0
    };
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  .swipe
    height $px2rem( 400px )
  .carousel
    .kzj
    .xgla
    .ttc
      background-color: #fff
      background-position: center center
      background-repeat: no-repeat
      background-size: contain
      width: 100%
      height: $px2rem( 400px );
    .xgla
      background-color: #0E113A
</style>
