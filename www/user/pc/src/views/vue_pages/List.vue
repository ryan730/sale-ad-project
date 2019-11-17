<template lang="jade">
  .list
    .top
      Logo
    SubMenu( :color="color" )
    .banner
      img( src="~images/list_banner.png" )
    List( :list="list" )
</template>

<script>
import SubMenu from 'modules/SubMenu.vue';
import List from 'modules/List.vue';
import Cart from '@/units/core/Cart';
import CODES from '@/units/CONFIG/codes';
import URLS from '@/units/CONFIG/urls';
import Bus from '@/units/core/EventBus';
import ajax from '@/units/core/AJAX';
import Logo from 'modules/Logo.vue';

export default {
  name: 'list',
  components: {
    SubMenu,
    List,
    Logo
  },
  data() {
    return {
      list: [],
      color: 'dark'
    };
  },
  mounted() {
    // todo: 完成兄弟组件之间的通信
    Bus.$on( 'updataList', params => {
      this.getList( params );
    } );
    Cart.getCartList( {
      $store: this.$store
    } );
    this.getList( {
      type: this.$route.params.id
    } );
  },
  methods: {
    // todo: 读取端口列表信息
    getList( params ) {
      ajax.get( {
        url: URLS.LIST,
        data: {
          params: {
            flag: 1,
            commodityTypeID: params.type
          }
        },
        success: res => {
          let data = res.data;

          if ( data.code === CODES.SUCCESS ) {
            let content = data.result.content || data.result;

            this.list = [];
            content.forEach( item => {
              item.pic = item.pic ? URLS.BaseURL + item.pic : '';
              this.list.push( {
                id: item.commodityID,
                img: item.pic,
                name: item.commodityName,
                money: item.price
              } );
            } );
          } else {
            console.warn( res.data.msg );
          }
        }
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .list
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .banner
      background-color: #080d33
      text-align: center
      img
        max-width 100%
        max-height 100%
</style>
