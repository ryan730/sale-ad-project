<template lang="jade">
  #slider_mine 
    .menu
      ul
        li 口子窖
        li 香格里拉
        li 土特产
    .opear
      ul
        li.index
          router-link( to="/index", tag="span" ) 首页
        li.mine
          router-link( to="/mine/mine", tag="span" ) 我的
</template>

<script>
export default {
  name: 'slider_mine',
  methods: {
    index() {
      this.$store.dispatch( 'changeBackpath', {
        backPath: this.$route.path
      } );

      this.$router.push( {
        name: 'index',
        params: {
          from: 'index'
        }
      } );
    },
    mine() {
      this.$store.dispatch( 'changeBackpath', {
        backPath: this.$route.path
      } );

      this.$router.push( {
        name: 'mine',
        params: {
          from: 'mine'
        }
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #slider_mine
    background: #1B1D43
    position: fixed
    display: flex
    flex-direction: column
    align-items: center
    justify-content: space-between;
    right: 0
    top: 0
    width: 0
    height: 100%
    color: #fff
    font-size: $px2rem( 32px )
    ul
      li
        padding: $px2rem( 30px 0 )
    .opear
    .menu
      width: 100%
      text-align: center
    .opear
      li
        background-position: $px2rem( 84px ) center 
        background-repeat: no-repeat
        background-size: $px2rem( 48px 48px )
        border-top: 1px solid #fff
        padding-left: $px2rem( 50px )
      .index
        background-image: url( '~images/icon_home_defult.png' ) 
      .mine
        background-image: url( '~images/icon_mine_defult.png' ) 

  .move-out-mine
    width: $px2rem( 302px ) !important
    transition: width 1s ease-out;
</style>