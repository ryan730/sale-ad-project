<template lang="jade">
  .pay-in-line
    .top
      Logo
      Process( :step="step", :steps="steps" )
    .pay-info
      .info
        span.title 订单提交成功
        span.orderID 订单号：{{order.orderID}}
        span.time
          | 请在
          i 1小时59分59秒
          | 内完成支付
      .addr
        span.count 应付金额：￥{{order.realPrice}}
        span.name-addr
          span.name {{order.addr.contacts}}
          span.arr {{order.addr.receivingAddr}}  {{order.addr.mobile}}
    .pay-type
      .title 请选择支付方式
      .type
        ul
          li( :class="{curr: weixin}", @click="changePayType( 'weixin' )" )
            a.weixin( href="#" )
          li( :class="{curr: zhifubao}", @click="changePayType( 'zhifubao' )" )
            a.zhifubao( href="#" )
</template>

<script>
import Logo from 'public/modules/Logo.vue';
import Process from 'public/modules/Process.vue';
import { pay } from '@/core/api';

export default {
  name: 'payinline',
  components: {
    Logo,
    Process
  },
  data() {
    return {
      step: 3,
      steps: [
        '查看购物车',
        '确认订单信息',
        '在线付款',
        '收货'
      ],
      weixin: false,
      zhifubao: false,
      order: {
        addr: {
          contacts: '',
          receivingAddr: '',
          mobile: ''
        }
      },
    };
  },
  mounted() {
    this.fetchCart( this.getUserID() );
    this.order = this.$store.getters['pubStore/getPayOrder'];
    this.order.addr = this.order.orderReceivingAddr.receivingAddr;
  },
  methods: {
    // todo: 切换支付类型
    changePayType( type ) {
      switch ( type ) {
        case 'weixin':
          this.weixin = true;
          this.zhifubao = !this.weixin;
          break;
        case 'zhifubao':
          this.zhifubao = true;
          this.weixin = !this.zhifubao;
          break;
      }
      this.pay();
    },

    // todo: 获取订单信息
    pay() {
      let win = window.open();

      pay( {
        data: {
          orderID: this.getOrderID(),
          orderSource: 1,
          payType: ( () => {
            let type;

            if ( this.weixin ) {
              type = 3;
            } else if ( this.zhifubao ) {
              type = 2;
            } else {
              type = 1;
            }
            return type;
          } )(),
          clientType: ( () => {
            const userAgent = window.navigator.userAgent;

            return userAgent.match( /AppleWebKit.*Mobile.*/ ) ? 2 : 1;
          } )()
        }
      } ).then( data => {
        win.document.write( data.result );
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .pay-in-line
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .pay-info
      display flex
      justify-content center
      align-items center
      margin-top: 20px
      .info
        display flex
        flex-direction column
        align-items center
        justify-content center
        border 1px solid #F0F3F5
        border-right 0
        width: 446px
        height: 188px
        color: #333333
        text-align: center
        span
          display block
        .title
          font-size: 20px
        .orderID
          font-size 14px
        .time
          margin-top: 13px
          font-size: 14px
          i 
            color: #fb596d
      .addr
        background: #F4F5FB
        border 1px solid #F0F3F5
        border-left 0
        width: 549px
        height: 188px
        .count
          display block
          padding-top: 44px
          padding-left: 31px
          padding-bottom: 42px
          border-bottom: 1px solid #fff
          font-size: 16px
          color: #333333
        .name-addr
          display block
          margin-top: 15px
          font-size: 14px
          color: #999999
          span
            display block
            padding-left: 31px
            margin-bottom: 5px
            &:last-child
              margin-bottom: 0
    .pay-type
      display flex
      flex-direction column
      margin-top: 30px
      margin-left: 221px
      margin-bottom: 198px
      .title
        align-self center
        margin-left: -1100px
      .type
        margin-top: 20px
        overflow: hidden
        align-self center
        margin-left: -610px
        ul
          li
            float: left
            width: 280px
            height: 80px
            margin-right: 40px
            border 1px solid #F0F3F5
            &:last-child
              margin-right: 0
        a
          display block
          width: 280px
          height: 80px
        .weixin
          background: url( '~assets/public/images/weixin.png' ) center center no-repeat;
        .zhifubao
          background: url( '~assets/public/images/zhifubao.png' ) center center no-repeat;
        .curr
          background: url( '~assets/public/images/pay_icon.png' ) right top no-repeat
          border 2px solid #2D316C
</style>
