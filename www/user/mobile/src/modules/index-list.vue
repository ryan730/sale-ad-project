<template lang="jade">
  #list
    router-link( to="/list/1010" )
      img.kzj( src="~images/kzj.png" )
    router-link( to="/list/1020" )
      img.xgla( src="~images/xgla.png" )
    router-link( to="/list/1030" )
      img.ttc( src="~images/ttc.png" )
</template>

<script>
export default {
  name: 'indexList'
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #list
    display flex
    flex-direction column
    align-items center
    width: 100%
    .kzj
    .xgla
    .ttc
      display block
      background-color: #fff
      background-size: contain
      width: auto
      height: $px2rem( 400px );
</style>
