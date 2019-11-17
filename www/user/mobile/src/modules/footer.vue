<template lang="jade">
  footer.footer
    nav.nav
      .nav-main( v-if="type === 'main' || !type" )
        span.index( @touchstart="index", :class="{'index-curr': isIndex}" ) 
          em.icon
          | 首页
        span.cart( @touchstart="cart", :class="{'cart-curr': isCart}" ) 
          em.icon
          em.num( v-if="num > 0" ) {{num ? num : 0}}
          |购物车
        span.my( @touchstart="mine", :class="{'my-curr': isMine}" ) 
          em.icon
          | 我的
      .nav-addr( v-if="type === 'addr'", @touchstart="addAddr" )
        | 新增收货地址
      .nav-detail( v-if="type === 'detail' " )
        .opear
          span.reduce -
          input( type="number" value="1" )
          span.add +
        .addCart 加入购物车
</template>

<script>
export default {
  name: 'footer',
  props: ['type', 'from', 'num'],
  data() {
    return {
      isIndex: true,
      isCart: false,
      isMine: false
    };
  },
  mounted() {
    switch ( this.from ) {
      case 'index':
        this.isIndex = true;
        this.isCart = this.isMine = !this.isIndex;
        break;

      case 'cart':
        this.isCart = true;
        this.isIndex = this.isMine = !this.isCart;
        break;

      case 'mine':
        this.isMine = true;
        this.isIndex = this.isCart = !this.isMine;
        break;
    }

    this.moveOut();
  },
  methods: {
    moveOut() {
      this.$store.dispatch( 'changeMoveout', {
        moveOut: false
      } );
    },
    index() {
      this.$router.push( {
        name: 'index',
        params: {
          from: 'index'
        }
      } );

      this.isIndex = true;
      this.isCart = this.isMine = !this.isIndex;
      this.moveOut();
    },
    cart() {
      this.$router.push( {
        name: 'cart',
        params: {
          from: 'cart'
        }
      } );

      this.isCart = true;
      this.isIndex = this.isMine = !this.isCart;
      this.moveOut();
    },
    mine() {
      this.$router.push( {
        name: 'mine',
        params: {
          from: 'mine'
        }
      } );

      this.isMine = true;
      this.isIndex = this.isCart = !this.isMine;
      this.moveOut();
    },
    addAddr() {
      this.$router.push( {
        path: '/addAddr'
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  .footer
    background #fff
    border-top 1px solid #F0F3F5
    height: $px2rem( 100px )
    line-height: $px2rem( 100px )
    .nav
      border-top 1px solid #F0F3F5
      height: $px2rem( 100px )
      .nav-main
        display: grid
        grid-template-columns 1fr 1fr 1fr
        justify-items center
        align-items center
        height: $px2rem( 100px )
        .index
        .cart
        .my
          display flex
          flex-direction column
          align-items center
          height normal
          line-height normal
          color: #666666;
          font-size: $px2rem( 24px )
          text-align: center
          .icon
            background-repeat: no-repeat
            background-size: contain
            width: $px2rem( 48px )
            height: $px2rem( 48px )
        .index
          .icon
            background-image: url( '~images/icon_home_defult.png' )
        .cart
          position relative
          .icon
            background-image: url( '~images/icon_shop_defult.png' )
          .num
            background #FF2A44
            position absolute
            right 0
            top 0
            width $px2rem( 32px )
            height $px2rem( 32px )
            border-radius $px2rem( 32px )
            color #fff
            font-size $px2rem( 24px )
        .my
          .icon
            background-image: url( '~images/icon_mine_defult.png' )
        .index-curr
          .icon
            background-image: url( '~images/index_hover.png' )
        .cart-curr
          .icon
            background-image: url( '~images/cart_hover.png' )
        .my-curr
          .icon
            background-image: url( '~images/my_hover.png' )

      .nav-addr
        background: #fff
        border: 1px solid #C5C6D6
        height: $px2rem( 96px )
        line-height: $px2rem( 96px )
        text-align: center
        font-size: $px2rem( 32px )
        color: #2D316C
      .nav-detail
        display: flex
        align-items: center
        width: 100%
        height: $px2rem( 100px )
        padding-left: $px2rem( 38px )
        .opear
          display: flex
          align-items: center
          flex: 1
          .reduce
          .add
            width: $px2rem( 72px )
            height: $px2rem( 72px )
            line-height: $px2rem( 60px )
            border: 1px solid #F0F3F5
            color: #cccccc
            font-size: $px2rem( 58px )
            text-align: center
          input
            width: $px2rem( 160px )
            height: $px2rem( 72px )
            border: 1px solid #F0F3F5
            padding-left: $px2rem( 20px )
            margin: 0 $px2rem( 10px )
            font-size: $px2rem( 32px )
            color: #1B1D43
        .addCart
          background: #2D316C
          width: $px2rem( 280px )
          height: $px2rem( 98px )
          line-height: $px2rem( 98px )
          text-align: center
          font-size: $px2rem( 32px )
          color: #fff
</style>