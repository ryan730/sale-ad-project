<template lang="jade">
  #mine
    HeaderIndex( :header="header", :title="title" )
    .content
      .person
        .img-name
          img( :src="src" )
          span.name-phone
            span.name xxxx
            span.phone 12131312
        router-link.preferences( :to="{path: '/preferences'}" ) 设置
      .addr
        .orders
          router-link.title( :to="{path: '/account'}" ) 我的订单
          span
            em 5
        .addr-info
          router-link.title( :to="{path: '/adminAddr'}" ) 收货地址管理
          span
      .modify
        .password
          router-link.title( :to="{path: '/editPassword'}" ) 修改密码
          span
        .phone
          router-link.title( :to="{path: '/phoneNum'}" ) 更改手机号
          span
      .cancel 注 销
    FooterBar( :type="main", :from="from", :num="cartNum" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import Cart from '@/units/core/Cart.js';
import FooterBar from 'modules/footer.vue';

export default {
  name: 'mine',
  props: ['from'],
  components: {
    HeaderIndex,
    FooterBar
  },
  data() {
    return {
      header: 'other',
      main: 'main',
      title: '我的',
      src: 'images/mine_person_def.png',
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
  },
  methods: {
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #mine
    background: #F4F5FB
    width: 100%
    .content
      div
        background: #fff
        display: flex
        justify-content: space-between
        align-items: center
        padding: 0 $px2rem( 30px )
        font-size: $px2rem( 32px )
        color: #666
      a
        margin-right $px2rem( 30px )
        color: #666
      .person
        width: $px2rem( 750px )
        height: $px2rem( 222px )
        line-height: $px2rem( 222px )
        margin-bottom: $px2rem( 20px )
        padding-left 0
        .img-name
          img
            margin-right: $px2rem( 20px )
            width $px2rem( 160px )
            height $px2rem( 160px )
          .name-phone
            display: flex
            flex-direction: column
            span
              line-height: normal
            .name
              margin-bottom: $px2rem( 10px )
              font-size: $px2rem( 36px )
              font-weight: bold
              color: #333333;
        .preferences
          &:after
            content: '>'
            margin-left: $px2rem( 26px )
            color: #E8E9F1
            font-size: $px2rem( 36px )
      .addr
      .modify
        flex-direction: column
        align-items: flex-start;
        .orders
        .addr-info
        .password
        .phone
          width: 100%
          height: $px2rem( 100px )
          span
            display: inline-block
            margin-right $px2rem( 30px )
            &:last-child
              position: relative
              &:after
                content: '>'
                color: #E8E9F1
      .addr
      .modify
        margin-bottom: $px2rem( 22px )
        .orders
        .addr-info
        .password
        .phone
          .title
            background-repeat: no-repeat
            background-size: contain
            padding-left: $px2rem( 52px )
            width: 100%
      .addr
        .orders
          border-bottom: 1px solid #F0F3F5
          .title
            background-image: url( '~images/order.png' )
          span
            &:last-child
              em
                position: absolute
                background: #FF2A44
                top: 50%
                right: $px2rem( 35px )
                margin-top: $px2rem( -16px )
                width: $px2rem( 32px )
                height: $px2rem( 32px )
                line-height: $px2rem( 32px )
                border-radius: $px2rem( 32px )
                text-align: center
                font-size: $px2rem( 24px )
                color: #fff
        .addr-info
          .title
            background-image: url( '~images/address.png' )
      .modify
        margin-bottom: $px2rem( 60px )
        .password
          border-bottom: 1px solid #F0F3F5
          .title
            background-image: url( '~images/code.png' )
        .phone
          .title
            background-image: url( '~images/phone.png' )
      .cancel
        justify-content: center;
        width: 100%
        height: $px2rem( 100px )
        line-height: $px2rem( 100px )
        padding-left 0
        color: #2D316C
        font-size: $px2rem( 36px )
</style>