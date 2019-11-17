<template lang="jade">
  el-carousel.carousel( :interval="2000", height="680px" )
    el-carousel-item.bg-kzj
      img.kzj( src="static/pc/public/images/banner2.jpg" )
    el-carousel-item.bg-xgla
      img.xgla( src="static/pc/public/images/banner1.jpg" )
    el-carousel-item.bg-ttc
      img.ttc( src="static/pc/public/images/banner3.jpg" )
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
      width inherit
      height: 680px;
    .xgla
      background-color: #0E113A
    .bg-kzj
      background-color: #a80a0b
    .bg-xgla
      background-color: #000
    .bg-ttc
      background-color: #fafbfd
</style>
