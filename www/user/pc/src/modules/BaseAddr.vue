<template lang="jade">
  #addr
    ul
      li( v-for="(item, index) in items" )
        .name-addr-phone
          span.name xxxx
          span.addr xxxx
          span.phone 12345678901
        .opper
          input( type="radio" id="index" )
          label( for="index" ) 默认地址
    a.add-addr( href="#" ) + 新增收货地址
</template>

<script>
  export default {
    name: 'addr',
    data() {
      return {
        items: 5
      };
    }
  };
</script>

<style lang="stylus" scoped>
  #addr
    padding-top 30px
    ul
      overflow hidden
      li
        display flex
        justify-content space-between
        padding-left 20px
        padding-right 50px
        height 50px
        line-height 50px
        font-size 14px
        &:nth-child(odd)
          background #F4F5FB
        .name-addr-phone
          display flex
          justify-content center
          span
            display inline-block
            margin-right 20px
            color #666
          .name
            color #333
          .addr
            width 200px
            white-space nowrap
            text-overflow ellipsis
            overflow hidden
        .opper
          color #2D316C
          font-size 14px
          label
            margin-left 7px
    .add-addr
      display block
      background #2D316C
      width 130px
      height 40px
      line-height 40px
      margin-top 40px
      text-align center
      color #fff
      font-size 14px
</style>