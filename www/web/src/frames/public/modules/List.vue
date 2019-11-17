<template lang="jade">
  .list-items
    ul
      li( v-for="item in list" )
        img( :src="item.img",@click='clickHandler( item.id )')
        span {{item.name}}
        span.money {{item.money}}
        span.add( :id="item.id", @click="addToCart" ) 加入购物车
</template>

<script>
import URLS from '@/config/urls';
import { addToCart } from '@/core/api';

export default {
  name: 'list',
  props: ['list'],
  methods: {
    clickHandler( id ) {
      this.$router.push( '/detail/' + id );
    },
    addToCart( evt ) {
      let target = evt.target;

      addToCart( {
        data: {
          userID: this.getUserID(),
          commodityID: target.id,
          num: 1
        }
      } ).then( data => {
        this.$store.dispatch( 'pubStore/changeCartNum', {
          num: this.$store.getters['pubStore/getCartNum'] + 1
        } ).then( () => {
          this.$message( {
            type: 'success',
            message: data.msg
          } );
        } );
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .list-items
    ul
      display grid
      grid-template-columns 1fr 1fr 1fr
      grid-gap 1px
      justify-content center
      margin: 0 230px 30px
      border-left 1px solid #F0F3F5
      li
        background: #ffffff
        padding-bottom: 50px
        border-left 0
        border-right 1px solid #F0F3F5
        border-bottom 1px solid #F0F3F5
        font-size: 16px
        color: #333333
        text-align: center
        img
          width 320px
          cursor pointer
        span
          display block
        .money
          margin-top: 10px
          margin-bottom: 18px
          &:before
            content '￥'
        .add
          display: inline-block
          cursor: pointer
          color: #2d316c
          font-size: 16px
          &:before
            content '+'
            padding-right: 5px
</style>
