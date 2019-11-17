<template lang="jade">
  #addr
    ul
      li( v-for="(item, index) in address" )
        .name-addr-phone
          span.name {{item.contacts}}
          span.addr {{item.receivingAddr}}
          span.phone {{item.mobile}}
        .opper
          input( type="radio" id="index", :checked="item.defaultFlag" )
          label( for="index" ) 默认地址
    a.add-addr( @click="showAddrs" ) + 新增收货地址
    .marker( v-if="isNewAddr", :style="style" )
      Addr( @close="close", @getNewAddr="getNewAddr" )
</template>

<script>
import Addr from './NewAddr.vue';
import { getCustomerReceivingAddr } from '@/core/api';

export default {
  name: 'addr',
  components: {
    Addr
  },
  data() {
    return {
      address: [],
      isNewAddr: false,
      style: {}
    };
  },
  mounted() {
    getCustomerReceivingAddr( {
      data: {
        userID: this.getUserID()
      }
    } ).then( data => {
      this.address = data.result;
    } );
  },
  methods: {
    showAddrs() {
      let D = document;
      let max = Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
      );

      this.isNewAddr = true;
      this.style = {
        height: max + 'px'
      };
    },

    getNewAddr( data ) {
      this.address.push( data.result );
    },

    close() {
      this.isNewAddr = false;
    }
  }
};
</script>

<style lang="stylus" scoped>
  #addr
    padding-top 30px
    .marker
      position absolute
      background-color rgba( 0, 0, 0, 0.6 )
      left 0
      top 0
      width 100%
      height 100%
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
      cursor pointer
</style>