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
      Addr( @close="close" )
</template>

<script>
import Addr from './NewAddr.vue';
import ajax from '@/units/core/AJAX';
import codes from '@/units/CONFIG/codes';
import urls from '@/units/CONFIG/urls';

export default {
  name: 'addr',
  components: {
    Addr
  },
  computed: {
    address() {
      return this.$store.getters.getAddress;
    }
  },
  data() {
    return {
      isNewAddr: false,
      style: {}
    };
  },
  mounted() {
    ajax.post( {
      url: urls.getCustomerReceivingAddr,
      data: {
        userID: this.$store.getters.getUser.userID
      },
      success: res => {
        let data = res.data;

        if ( data.code === codes.SUCCESS ) {
          this.$store.dispatch( 'clearAddress' ).then( () => {
            data.result.forEach( item => {
              this.$store.dispatch( 'changeAddress', {
                contacts: item.contacts,
                defaultFlag: item.defaultFlag,
                mobile: item.mobile,
                receivingAddr: item.receivingAddr,
                receivingAddrID: item.receivingAddrID
              } );
            } );
          } );
        } else {
          this.$message( {
            message: data.msg,
            type: 'error'
          } );
        }
      }
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