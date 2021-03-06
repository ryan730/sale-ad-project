<template lang="jade">
  .shopping-cart
    .top
      Logo
      Process( :step="step", :steps="steps" )
    .header
      span.name 商品
      span.price 单价
      span.num 数量
      span.count 小计
      span.operate 操作
    .body
      transition-group( name="itemlist" tag="div" )
        .row( v-for="(item, index) in items", :key="item.cartListID" )
          span
            img( :src="item.commodity.pic" )
            span {{item.commodity.commodityName}}
          span.price
            em.line-through 指导价
             i ￥{{item.commodity.price}}
            em 会员价 ￥{{typeof item.commodity.commodityChannel === 'number' ? item.commodity.commodityChannel : 0}}
          span.num
            em.reduce( @click="reduce( index )" ) -
            input( type="text", :value="item.num" )
            em.add( @click="add( index )" ) +
          span.count {{item.totalAmount}}
          span.operate 
            em( @click="del( index, item.cartListID )" ) 删除
    .footer
      span.account( @click="commit") 立即结算
</template>

<script>
import Process from 'modules/Process.vue';
import Logo from 'modules/Logo.vue';
import CODES from '@/units/CONFIG/codes';
import URLS from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';
import Cart from '@/units/core/Cart';

let time;

export default {
  name: 'cart',
  components: {
    Process,
    Logo
  },
  data() {
    return {
      step: 1,
      steps: [
        '查看购物车',
        '确认订单信息',
        '在线付款',
        '收货'
      ],
      items: []
    };
  },
  mounted() {
    Cart.getCartList( {
      $store: this.$store,
      success: data => {
        data.result.forEach( item => {
          item.commodity.pic = item.commodity.pic
            ? URLS.BaseURL + item.commodity.pic
            : '';
        } );

        this.items = data.result;
      }
    } );
  },
  methods: {
    // todo: 增加数量
    add( index ) {
      let item = this.items[index];

      item.num += 1;
      item.totalAmount = item.commodity.commodityChannel
        ? item.num * item.commodity.commodityChannel
        : item.num * item.commodity.price;
      this.changeCommodityNum( {
        id: item.cartListID,
        num: item.num
      } );
    },

    // todo: 删减数量
    reduce( index ) {
      let item = this.items[index];
      let val = item.num - 1;

      item.num = val > 0 ? val : 1;
      item.totalAmount = item.commodity.commodityChannel
        ? item.num * item.commodity.commodityChannel
        : item.num * item.commodity.price;
      this.changeCommodityNum( {
        id: item.cartListID,
        num: item.num
      } );
    },

    // todo: 删除条目
    del( index, id ) {
      ajax.post( {
        url: URLS.delCommodity,
        data: {
          cartListID: id
        },
        success: res => {
          res.data.code === CODES.SUCCESS
            ? this.items.splice( index, 1 )
            : console.error( res.msg );
        }
      } );
    },

    // todo: 每修改一次数量都要向后端记录一下
    changeCommodityNum( params ) {
      let ms = 1000;

      clearTimeout( time );
      time = setTimeout( () => {
        ajax.post( {
          url: URLS.changeCommodityNum,
          data: {
            cartListID: params.id,
            num: params.num
          },
          success( res ) {
            res.data.code !== CODES.SUCCESS && console.error( res.msg );
          }
        } );
      }, ms );
    },

    // todo: 立即结算
    commit() {
      console.log( this.$store );
      ajax.post( {
        url: URLS.commitCart,
        data: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c',
          carts: this.$store.getters.getCartItems
        },
        success: res => {
          console.log( res );
        }
      } );
      /*
      this.$router.push( {
        path: '/confirm'
      } );
      */
    }
  }
};
</script>

<style lang="stylus" scoped>
  .itemlist-enter-active,
  .itemlist-leave-active 
    transition: all 1s;

  .itemlist-enter,
  .itemlist-leave-active 
    opacity: 0;

  .shopping-cart
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .header
      display grid
      grid-template-columns 370px 2fr 2fr 1fr 1fr
      margin-left: 310px
      margin-right: 240px
    .body
      padding-left: 310px
      padding-right: 240px
      .row
        display grid
        grid-template-columns 370px 2fr 2fr 1fr 1fr
    .header
      background: #F4F5FB
      height: 40px
      line-height: 40px
      margin-top: 20px
      color: #333333
      font-size: 14px
      text-align: center
      input
        margin-right: 5px
    .body
      background: #ffffff
      text-align: center
      font-size: 14px
      color: #333333
      .row
        border-bottom 1px solid #F0F3F5
        span
          display flex
          align-items center
          justify-content center
          &:first-child
            text-align left
          img
            width 180px
          input
            width: 70px
            height: 36px
            border 1px solid #C5C6D6
            border-radius 2px
            margin 0 5px
            text-align: center
        .operate
          font-size: 14px
          color: #2d316c
        .count
          &:before
            content '￥'
            margin-right: 3px
        .price
          display flex
          flex-direction column
        .line-through
          i
            text-decoration line-through
        .num
          .reduce
          .add
            display inline-block
            width 34px
            height 34px
            line-height 34px
            text-align center
            border 1px solid #C5C6D6
            border-radius 2px
            cursor pointer
        .count
          font-weight: bold
    .footer
      display flex
      justify-content: flex-end
      background: #F4F5FB
      height: 50px
      line-height: 50px
      margin-left: 310px
      margin-right: 240px
      margin-top: 20px
      margin-bottom: 214px
      color #333
      font-size 14px
      .info
        margin-right 22px
        text-align: right
        font-size: 14px
      .fare
        margin-right: 39px
        color: #999999
        font-size 14px
      .account
        display block
        background: #2d316c
        width 151px
        height 50px
        margin-left 39px
        font-size: 16px
        color: #ffffff
        text-align: center
        cursor pointer
</style>
