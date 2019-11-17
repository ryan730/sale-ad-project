<template lang="jade">
  .prods
    .top
      Logo
    Carousel
    router-link.KZJ( to="/list/1010" )
      img( src="~images/pic2_index.png" )
    router-link.XGLL-SRL( to="/list/1020" )
      img( src="~images/pic3_index.png" )
    router-link.TTC( to="/list/1030" )
      img( src="~images/pic4_index.png" )
</template>

<script>
import Logo from 'modules/Logo.vue';
import Carousel from 'modules/carousel.vue';
import Cart from '@/units/core/Cart';

export default {
  name: 'index',
  components: {
    Logo,
    Carousel
  },
  mounted() {
    Cart.getCartList( {
      $store: this.$store
    } );
  }
};
</script>

<style lang="stylus" scoped>
  .prods
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    a
      display block
      background-size: contain
      background-repeat no-repeat
    .KZJ
    .XGLL-SRL
    .TTC
      img
        width auto
        width 100%
        object-fit contain
    .XGLL
      background-color: #030702
      height: 760px
    .KZJ
      img
        height 543px
    .XGLL-SRL
      background-color: #0E113A
      img
        height: 543px
    .TTC
      img
        height: 543px
</style>
