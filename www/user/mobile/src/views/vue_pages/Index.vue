<template lang="jade">
  #index
    HeaderIndex( :header="header" )
    .content
      Carousel
      List
    FooterBar( :type="main", :num="cartNum" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import Carousel from 'modules/carousel.vue';
import List from 'modules/index-list.vue';
import FooterBar from 'modules/footer.vue';
import Cart from '@/units/core/Cart.js';

export default {
  name: 'index',
  components: {
    HeaderIndex,
    Carousel,
    List,
    FooterBar
  },
  data() {
    return {
      header: 'index',
      main: 'main',
      cartNum: 0
    };
  },
  mounted() {
    Cart.getCartList( {
      $store: this.$store,
      success: () => {
        this.cartNum = this.$store.getters.getCartNum;
      }
    } );
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #index
    display: flex
    flex-direction: column
    width: 100%
    height: 100%

    .content
      color:red 
      flex:none !important
</style>