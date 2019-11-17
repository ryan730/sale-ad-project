<template lang="jade">
  .order-item
    .item( v-for='(item, index) in items', :class="{item_checkbox:isCart, item_no_checkbox: isAccount}" )
      img.icon( :src="item.commodity.pic" )
      .info
        h3
          span.title {{item.commodity.commodityName}}
          span.del( @touchstart="del( index, item.cartListID )") 删除
        .money {{item.commodity.price}}
        .tags( v-if="item.tags && item.tags.length > 0" )
          span( v-for='tag in item.tags' ) {{tag}}
        .reduce-add( v-if="isCart" )
          span.add( @touchstart="add( index )" ) +
          input( type="text", :value="item.num" )
          span.reduce( @touchstart="reduce( index )") -
        .num( v-else ) 88
        .count
          span.sum {{item.amount}}
        .discount( v-if="isAccount" )
          h3 多买多送，买六送一
          p [赠品] 古井贡酒年份原浆10年50度浓香型500ml  X 1
</template>

<script>
import { MessageBox } from 'mint-ui';
import CODES from '@/units/CONFIG/codes';
import URLS from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';

export default {
  name: 'order',
  props: ['items', 'isCart', 'isAccount'],
  data() {
    return {
      tags: 0
    };
  },
  methods: {
    add( index ) {
      let item = this.items[index];
      item.num = Number(item.num);
      item.num += 1;
      item.amount = Number(item.num) * Number(item.commodity.price);
      this.totalAmount();
    },
    reduce( index ) {
      let item = this.items[index];
      item.num = Number(item.num);
      if ( item.num > 1 ) {
        item.num -= 1;
        item.amount = Number(item.num) * Number(item.commodity.price);

        this.totalAmount();
      }
    },
    del( index, id ) {
      ajax.post( {
        url: URLS.delCommodity,
        data: {
          cartListID: id
        },
        success: res => {
          res.data.code === CODES.SUCCESS
            ? this.items.splice( index, 1 )
            : MessageBox.alert( res.msg );
        }
      } );
    },
    totalAmount() {
      let total = 0;

      this.items.forEach( item => {
        total += Number(item.amount);
      } );


      this.$emit( 'total', {
        total
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  .order-item
    overflow: hidden;
    .item_checkbox
      grid-template-columns: 2fr 5fr
    .item_no_checkbox
      grid-template-columns: 2fr 5fr
    .item
      display: grid;
      align-items: center
      border-top: 1px solid #F0F3F5
      padding-top: $px2rem( 20px )
      &:first-child
        border-top: 0
      .checkbox
        justify-self center
        align-self flex-start
        margin-top $px2rem( 20px )
      .icon
        width $px2rem( 160px )
      .info
        overflow: hidden;
        h3
          display: flex
          justify-content: space-between
          align-items: center
          font-weight: normal;
          .title
            font-size: $px2rem( 32px );
            color: #333333;
          .del
            margin-right: $px2rem( 28px )
            white-space: nowrap
            font-size: $px2rem( 28px );
            color: #2D316C
        .money
          margin-top: $px2rem( 10px )
          color: #999
          font-size: $px2rem( 30px );
          &:before
            content: '单价: ￥'
            margin-right: $px2rem( 10px )
        .reduce-add
          display flex
          margin: 20px 0
          .reduce
          .add
            background: #ffffff;
            width: $px2rem( 72px )
            height: $px2rem( 72px )
            line-height: $px2rem( 65px )
            border: 1px solid #F0F3F5
            font-size: $px2rem( 52px );
            text-align: center
            color: #cccccc;
          input
            width: $px2rem( 120px )
            height: $px2rem( 72px )
            margin: 0 10px
            padding: 0 10px
            border: 1px solid #F0F3F5 
            font-size: $px2rem( 32px );
            color: #1B1D43
        .num
          margin-top: $px2rem( 40px )
          margin-bottom: $px2rem( 20px )
          font-size: $px2rem( 32px );
          &:before
            content: '数量:'
            margin-right: $px2rem( 10px )
        .tags
          display: flex
          flex-wrap: wrap
          justify-content: flex-start;
          align-items: center
          text-align: center
          margin-top: $px2rem( 24px )
          margin-bottom: $px2rem( -10px )
          padding-bottom: $px2rem( 54px )
          span
            background: #fff;
            border: 1px solid #FB596D
            padding: 0 $px2rem( 16px )
            margin-right: $px2rem( 10px )
            margin-bottom: $px2rem( 10px )
            color: #FB596D
            font-size:$px2rem( 24px )
        .count
          display: flex
          justify-content: space-between
          align-items: center
          margin-bottom: $px2rem( 40px )
          font-size: $px2rem( 32px );
          font-weight: bold;
          .sum
            margin-right: $px2rem( 30px )
            &:before
              content: '￥'
        .discount
          background: #FFF7ED
          height: $px2rem( 186px )
          padding-top: $px2rem( 24px )
          margin-bottom: $px2rem( 40px )
          h3
            background-image: url( '~images/discount_icon.png' )
            background-repeat: no-repeat
            background-position: 20px 0
            background-size: contain
            padding-left: $px2rem( 90px )
            font-size: $px2rem( 28px );
          p
            margin-top: $px2rem( 16px )
            margin-left: $px2rem( 20px )
            font-size: $px2rem( 28px );
            color: #999999;
</style>