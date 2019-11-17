<template lang="jade">
  #account
    HeaderIndex( :header='header', :title="title" )
    .content
      .addr
        h3
          span 确认收货地址
          span.other( @touchstart="others" ) 使用其他收货地址
      .info
        .addr
          .name-phone
            span.name xxxx
            span.phone 12344455
          .addr-info xxxxxxx
        .other-addr 
          .info( v-show='show' )
            .addr( v-for='item in items' )
              .name-phone
                span.name xxxx
                span.phone 12344455
              .addr-info xxxxxxx
            span.add-addr 新增收货地址
      .order
        h3
          span 确认订单
        .info
          Order( :items='orders', :isAccount="isAccount" )
      .sum
        .discount
          h3 订单赠品
          ul.discount-items
            li( v-for="item in 3 " )
              img( src="~images/discount_pic.png" )
              .info
                .title xxxxxx
                .num 1
        Sum( :isAccount="isAccount" )
</template>

<script>
import HeaderIndex from '@/modules/header-index.vue';
import Order from '@/modules/order-item.vue';
import Sum from '@/modules/sum.vue';

export default {
  name: 'account',
  components: {
    HeaderIndex,
    Order,
    Sum
  },
  data() {
    return {
      header: 'other',
      title: '确认订单',
      show: false,
      items: 3,
      isAccount: true,
      orders: [
        {
          tags: 7
        },
        {
          tags: 7
        }
      ]
    };
  },
  methods: {
    others() {
      this.$store.dispatch( 'changeBackpath', {
        backPath: this.$route.path
      } );

      this.$router.push( '/adminAddr' );
    }
  }
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  #account
    width: 100%
    .content
      overflow: auto
      .addr
      .order
        margin-top: $px2rem( 40px )
        h3
          display: flex;
          justify-content: space-between;
          padding-left: $px2rem( 30px )
          border-left: 6px solid #2D316C
          font-size: $px2rem( 32px );
          color: #333333;
          .other
            padding-right: $px2rem( 30px )
            font-size: $px2rem( 30px );
            color: #2D316C
            font-weight: normal;
      .info
        padding: $px2rem( 40px ) $px2rem( 30px ) 0
        .other-addr
          margin-top: $px2rem( 40px )
          text-align: center
          color: #2D316C
          font-size: $px2rem( 28px );
          .info
            padding: 0;
            .addr
              margin-bottom: $px2rem( 20px )
            .add-addr
              margin-right: $px2rem( 30px )
              font-size: $px2rem( 30px );
              color: #2D316C
              font-weight: normal;
              &:before
                content: '+'
                margin-right: $px2rem( 14px )

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
      .order
        border-top: 1px solid #F0F3F5
        padding-top: $px2rem( 40px )
        .info
          margin-top: $px2rem( 20px )
          border-top: 1px solid #F0F3F5
      .sum
        border-top: 1px solid #F0F3F5
        padding: $px2rem( 40px ) $px2rem( 60px ) $px2rem( 40px )
        .discount
          position: relative;
          background: #FFF7ED
          padding: $px2rem( 96px ) $px2rem( 40px ) $px2rem( 40px )
          margin-bottom: $px2rem( 40px )
          h3
            position: absolute;
            top: -9px;
            left: 40px;
            width: $px2rem( 184px )
            height: $px2rem( 64px )
            line-height: $px2rem( 64px )
            background-image: url( '~images/icon1.png' )
            background-repeat: no-repeat
            background-size: contain
            font-size: $px2rem( 32px );
            text-indent: -8px
            text-align: center
            color: #ffffff;
          .discount-items
            li
              display: grid
              grid-template-columns: 1fr 5fr
              border-bottom: 1px dashed #ccc
              padding: $px2rem( 20px ) 0
              &:first-child
                padding-top: 0
              img
                width: $px2rem( 180px )
                height: auto
                margin-right: $px2rem( 60px )
              .info
                margin: 0;
                padding: 0;
                .title
                .num
                  font-size: $px2rem( 32px );
                  color: #333333;
                .title
                  margin-bottom: $px2rem( 20px )
                .num
                  &:before
                    content: '数量: '
</style>