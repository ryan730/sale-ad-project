<template lang="jade">
  .list
    .top
      Logo
    SubMenu( :color="color" )
    .banner( :class="bg" )
      img( :src="bannerImg" )
    List( :list="list" )
</template>

<script>
import SubMenu from 'public/modules/SubMenu.vue';
import Banner from '@/config/banners';
import List from 'public/modules/List.vue';
import URLS from '@/config/urls';
import Bus from '@/core/EventBus';
import { list } from '@/core/api';
import Logo from 'public/modules/Logo.vue';

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
      color: 'dark',
      banner: ''
    };
  },
  computed: {
    bg() {
      let bg;

      switch ( this.$route.params.id ) {
        case '1010':
          bg = 'bg-kzj';
          break;
        case '1020':
          bg = 'bg-xgla';
          break;
        case '1030':
          bg = 'bg-ttc';
          break;
      }

      return bg;
    },
    bannerImg() {
      return Banner[this.$route.params.id];
    }
  },
  mounted() {
    // todo: 完成兄弟组件之间的通信
    Bus.$on( 'updataList', params => {
      this.getList( params );
    } );
    this.fetchCart( this.getUserID() );
    this.getList( {
      type: this.$route.params.id
    } );
  },
  methods: {
    // todo: 读取端口列表信息
    getList( params ) {
      list( {
        data: {
          flag: 1,
          commodityTypeID: params.type
        }
      } ).then( data => {
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
      width 100%
      height 320px
      text-align: center
      img
        max-width 100%
        max-height 100%
    .bg-kzj
      background-color: #a80a0b
    .bg-xgla
      background-color: #000
    .bg-ttc
      background-color: #fafbfd
</style>
