<template lang="jade">
  .sum-item
    .sum-info
      h3 {{Number(total)}}
      .info( v-if="isAccount" )
        span 商品总数：9999
        span 优惠：999
    .balance( v-if="isCart" ) 立即结算
    .balance( v-if="isAccount" ) 去支付
</template>

<script>
export default {
  name: 'sum',
  props: ['total', 'isCart', 'isAccount']
};
</script>

<style lang="stylus" scoped>
  @import '~assets/css/funs/px2rem.styl';

  .sum-item
    .sum-info
      background: #F0F3F5;
      padding-top: $px2rem( 30px )
      h3
        padding-left: $px2rem( 40px )
        padding-bottom: $px2rem( 20px )
        margin-bottom: $px2rem( 24px )
        border-bottom: 1px dashed #fff
        color: #333333;
        font-size: $px2rem( 36px );
        &:before
          content: '总计：￥'
      .info
        padding-left: $px2rem( 40px )
        padding-bottom: $px2rem( 50px )
        span
          display: block
          font-size: $px2rem( 28px );
          color: #666666;
    .balance
      background: #2D316C;
      width: $px2rem( 630px )
      height: $px2rem( 96px )
      line-height: $px2rem( 96px )
      margin-top: $px2rem( 42px )
      color: #ffffff
      font-size: $px2rem( 32px )
      text-align: center
</style>