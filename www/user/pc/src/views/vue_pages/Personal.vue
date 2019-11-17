<template lang="jade">
  #personal
    .top
      Logo
    main.main
      .user-image
        img( :src="src" )
        .name 欢迎您，{{name}}
        span.my-order 我的订单
        span.setting 个人设置
      .user-info
        <!-- PersonalSetting -->
        <!-- MyOrderList -->
        MyOrderDetail
</template>

<script>
import Logo from 'modules/Logo.vue';
import PersonalSetting from 'modules/PersonalSetting.vue';
import MyOrderList from 'modules/MyOrdersList.vue';
import MyOrderDetail from 'modules/MyOrderDetail.vue';
import Cart from '@/units/core/Cart';

export default {
  name: 'personal',
  components: {
    Logo,
    PersonalSetting,
    MyOrderList,
    MyOrderDetail
  },
  data() {
    return {
      src: '',
      name: 'xxxx'
    };
  },
  mounted() {
    Cart.getCartList( {
      $store: this.$store
    } );
  }
};
</script>

<style lang="stylus" scoped>
  #personal
    margin-bottom: 156px
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .main
      display: flex
      justify-content: flex-start
      margin-top: 20px
      padding-left 233px
      .user-image
        margin-left: 80px
        img
          width: 140px
          height: 140px
          border: 1px solid red
        .name
          margin-top: 10px
          padding-bottom: 20px
          border-bottom: 1px solid #EBEBEB
          font-size: 14px
          text-align: center
          color: #333
        a
          display: block
        .my-order
        .setting
          display block
          height: 48px
          line-height: 48px
          padding-left: 20px
          text-align: center
          font-size: 16px
          cursor pointer
        .my-order
          background: url( '~images/myshopping.png' ) 26px center no-repeat
          color: #333
        .setting
          background: #0E113A url( '~images/setting.png' ) 26px center no-repeat
          color: #fff
      .user-info
        margin-left: 40px
        width 100%
</style>