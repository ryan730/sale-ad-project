<template lang="jade">
  Carousel.carousel( autoplay )
    CarouselItem
      img.kzj( src="~images/banner1.jpg" )
    CarouselItem
      img.xgla( src="~images/banner2.jpg" )
    CarouselItem
      img.ttc( src="~images/banner3.jpg" )
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
