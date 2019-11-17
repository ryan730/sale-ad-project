<template lang="jade">
  header.header( v-if="header === 'index'" )
    span.logo
    span.more( @touchstart="more" )
  header.other( v-else )
    span.back( @touchstart="back" ) 
      em.icon
      | 返回
    span.title {{title}}
    span.more( @touchstart="more" )
</template>

<script>
export default {
  name: 'header',
  props: ['header', 'title', 'showMine'],
  methods: {
    back() {
      this.$router.go( -1 );
    },
    more() {
      this.$store.dispatch( 'changeMoveout', {
        moveOut: !this.$store.getters.getMoveout
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  .more
    background-repeat: no-repeat
    background-size: contain
    margin-right: $px2rem( 17px );
    width: $px2rem( 48px )
    height: $px2rem( 48px )

  .header
    display: flex;
    align-items: center;
    justify-content: space-between
    background-color: #000000;
    height: $px2rem( 100px );
    line-height: $px2rem( 100px );
    padding-left: $px2rem( 30px );
    .logo
      background-image: url( '~images/logo.png' )
      background-repeat: no-repeat
      background-size: contain
      width: $px2rem( 216px )
      height: $px2rem( 52px )
    .title
      color: #C5C6D6
      font-size: $px2rem( 32px );
    .more
      background-image: url( '~images/hambg_wite.png' )

  .other
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-bottom: 1px solid #F0F3F5;
    height: $px2rem( 100px );
    line-height: $px2rem( 100px );
    .back
      display flex
      align-items center
      justify-items center
      margin-left: $px2rem( 34px );
      font-size: $px2rem( 32px );
      .icon
        display inline-block
        background: url( '~images/back.png' ) left center no-repeat;
        background-size contain
        width $px2rem( 36px )
        height $px2rem( 38px )
        margin-right $px2rem( 18px )

    .title
      margin-left: $px2rem( -25px );
      font-size: $px2rem( 36px );
    .more
      background-image: url( '~images/hambg.png' )
      margin-right: $px2rem( 32px );
</style>
