<template lang="jade">
  #cart
    HeaderIndex( :header='header', :title="title" )
    .content
      .order
        .info
          Order( :items='orders', :isCart="isCart", v-on:total="total" )
      .sum
        Sum( :isCart="isCart", :total="amount" )
    FooterBar( :type="main", :from="from", :num="cartNum" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import FooterBar from 'modules/footer.vue';
import urls from '@/units/CONFIG/urls.js';
import Cart from '@/units/core/Cart.js';
import Order from '@/modules/order-item.vue';
import Sum from '@/modules/sum.vue';

export default {
  name: 'cart',
  components: {
    HeaderIndex,
    FooterBar,
    Order,
    Sum
  },
  data() {
    return {
      main: 'main',
      from: 'cart',
      header: 'other',
      title: '购物车',
      show: false,
      isCart: true,
      orders: [],
      cartNum: 0,
      amount: 0
    };
  },
  mounted() {
    Cart.getCartList( {
      $store: this.$store,
      success: res => {
        this.orders = res.result.slice();
        this.cartNum = this.$store.getters.getCartNum;
        this.orders.forEach( item => {
          if ( item.commodity.hasOwnProperty( 'pic' ) ) {
            item.commodity.pic = urls.BaseURL + item.commodity.pic;
          }
          item.amount = Number(item.totalAmount);
          this.amount += Number(item.amount);
        } );
      }
    } );
  },
  methods: {
    total( params ) {
      this.amount = params.total;
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #cart
    width: 100%
    .content
      overflow: auto
      .order
        .addr
          background: #F0F3F5;
          margin-top: 0
          padding: $px2rem( 30px ) $px2rem( 40px )
          .name-phone
            display: flex;
            justify-content: space-between;
            align-items: center
            .name
              font-size: $px2rem( 36px );
              color: #333333;
            .phone
              font-size: $px2rem( 30px );
              color: #666666;
          .addr-info
            margin-top: $px2rem( 20px )
            word-wrap: break-word;
            text-align: left;
            font-size: $px2rem( 30px );
            color: #666666;
        .info
          margin-left: $px2rem( 30px )
      .sum
        border-top: 1px solid #F0F3F5
        padding: $px2rem( 40px ) $px2rem( 60px ) $px2rem( 40px )
</style>