<template lang="jade">
  .detail-info
    .product-detail
      .commodityImgs
        .product-item(v-for='item in infoData.commodityImgs',:style='{order:item.sequenceNumber}')
          img(:src='getProductPic(item.imgUrl)')
      .brandImgs
        .product-item(v-for='item in infoData.brandImgs',:style='{order:item.sequenceNumber}')
          img(:src='getProductPic(item.imgUrl)')
      .companyImgs
        .product-item(v-for='item in infoData.companyImgs',:style='{order:item.sequenceNumber}')
          img(:src='getProductPic(item.imgUrl)')
</template>

<script>
import URLS from '@/units/CONFIG/urls';

export default {
  props: {
    infoData: {
      type: Object,
      required: true,
      default: {}
    }
  },
  methods: {
    getProductPic( url ) {
      return this.infoData.pic ? URLS.BaseURL + url : '';
    }
  }
};
</script>

<style lang="stylus" scoped>
  .detail-info
    overflow: hidden
    .product-detail
      .commodityImgs
      .brandImgs
      .companyImgs
        display flex
        flex-direction column
        align-items center
        .product-item
          display: flex
          justify-content: center
</style>
