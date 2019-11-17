<template lang="jade">
  .sucess-pay
    .top( v-if="type !== 'phone'" )
      Logo( :title="title" )
      Process( v-if="steps.length > 0", :step="step", :steps="steps" )
    .info
      div( v-if="type === 'pay'" )
        span.title 支付完成
        span.dis 请您耐心等候，商品将尽快送到您的手中…
      div( v-if="type === 'pw'" )
        span.title 修改成功
        span.dis 您已成功修改密码，
          a( href="#" ) 立即登录
      div( v-if="type === 'register'" )
        span.title 注册成功
        span.dis 恭喜您成功注册久隆商贸,
          a( href="#" ) 立即登录
      div( v-if="type === 'phone'" )
        span.title 修改成功
        span.dis 您已成功修改手机号
</template>

<script>
  import Logo from 'modules/Logo.vue';
  import Process from 'modules/Process.vue';

  export default {
    name: 'sucessPay',
    components: {
      Logo,
      Process
    },
    props: ['type'],
    data() {
      return {
        mess: false,
        title: '',
        step: 4,
        steps: []
      };
    },
    mounted() {
      this.upLoad();
    },
    watch: {
      $route() {
        this.upLoad();
      }
    },
    methods: {
      upLoad() {
        switch ( this.type ) {
          case 'pay':
            this.steps = [
              '查看购物车',
              '确认订单信息',
              '在线付款',
              '收货'
            ];
            break;
          case 'pw':
            this.title = '修改密码';
            break;
          case 'register':
            this.title = '欢迎注册久隆商贸';
            break;
        }
      }
    }
  };
</script>

<style lang="stylus" scoped>
  .sucess-pay
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .info
      background: url( '~images/sucess.png' ) center 130px no-repeat
      padding-top: 130px
      padding-bottom: 313px
      text-align: center
      span
        display block
      .title
        margin-top: 70px
        margin-bottom: 3px
        font-size: 20px
        color: #70c216
      .dis
        font-size: 14px
        color: #999999
</style>
