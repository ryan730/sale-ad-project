<template lang="jade">
  #infomation
    .top
      Logo( :title="title" )
      .login( v-if="type === 'register'" )
        | 已有帐号？
        a( href="#" ) 立即登录
    main.main
      Process( :step="step", :steps="steps" )
      .form
        ul
          li
            span 手机号码
            input.phone( type="number" )
          li
            span 验证码
            input.code( type="text" )
            a.getCode( href="#" ) 获取验证码
          li
            span( v-if="type === 'register'") 设置密码
            span( v-else ) 设置新密码
            input.newPW( type="password" placeholder="请设置您的密码" )
          li
            span( v-if="type === 'register'") 确认密码
            span( v-else ) 确认新密码
            input.conform( type="password" placeholder="请确认您的密码" )
        a.ok( href="#", v-if="type === 'register'" ) 注册
        a.ok( href="#", v-else) 确认修改
</template>

<script>
import Logo from 'modules/Logo.vue';
import Process from 'modules/Process.vue';

export default {
  name: 'infomation',
  components: {
    Logo,
    Process
  },
  props: ['type'],
  data() {
    return {
      title: '',
      step: 1,
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
        case 'pw':
          this.title = '修改密码';
          this.stpes = [
            '填写信息',
            '修改成功'
          ];
          break;
        case 'register':
          this.title = '欢迎注册久隆商贸';
          this.steps = [
            '填写信息',
            '注册成功'
          ];
          break;
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
  #infomation
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .main
      display: flex
      flex-direction: column
      align-items: center
      margin-bottom: 158px
      .form
        padding-top: 30px
        li
          margin-bottom: 20px
          &:last-child
            margin-bottom: 0
          span
            display: inline-block
            width: 80px
            margin-right: 20px
            text-align: right
            color: #666
          input
            width: 370px
            height: 40px
            line-height: 40px
            border: 1px solid #C5C6D6
            padding-left: 15px
            font-size: 14px
            color: #333
          .newPW
          .conform
            color: #999
          .code
            width: 250px
          .getCode
            display: inline-block
            background: #E8E9F1
            width: 120px
            height: 40px
            line-height: 40px
            vertical-align: bottom
            border: 1px solid #C5C6D6
            border-left: none
            text-align: center
            color: #444B9C
        .ok
          display: block
          background: #2D316C
          width: 387px
          height: 50px
          line-height: 50px
          margin-top: 40px
          margin-left: 100px
          text-align: center
          font-size: 16px
          color: #fff
</style>