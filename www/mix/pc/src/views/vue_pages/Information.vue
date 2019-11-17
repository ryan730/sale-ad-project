<template lang="jade">
  #infomation
    .top
      Logo( :title="title" )
      .login( v-if="type === 'register'" )
        | 已有帐号？
        router-link( to="/login" ) 立即登录
    main.main
      Process( :step="step", :steps="steps" )
      .form
        ul
          li
            span 手机号码
            input.phone( type="number", v-model="mobile", @blur="checkPhone" )
          li
            span 验证码
            input.code( type="text", v-model="code" )
            span.getCode( @click="sendMobileVerifyCode", :st="isWait" ) {{codeText}}
          li
            span( v-if="type === 'register'") 设置密码
            span( v-else ) 设置新密码
            input.newPW( 
              type="password", 
              placeholder="请设置您的密码", 
              v-model="password",
              @blur="checkPassword"
            )
          li
            span( v-if="type === 'register'") 确认密码
            span( v-else ) 确认新密码
            input.conform( 
              type="password",
              placeholder="请确认您的密码", 
              v-model="comfirmPassword",
              @blur="checkPassword"
            )
        span.ok( href="#", v-if="type === 'register'", @click="register" ) 注册
        span.ok( href="#", v-else) 确认修改
</template>

<script>
import Logo from 'modules/Logo.vue';
import Process from 'modules/Process.vue';
import codes from '@/units/CONFIG/codes';
import urls from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';

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
      steps: [],
      mobile: '',
      code: '',
      codeText: '获取验证码',
      isWait: false,
      password: '',
      comfirmPassword: ''
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
    },

    // todo: 获取手机验证码
    sendMobileVerifyCode() {
      if ( !this.isWait ) {
        ajax.post( {
          url: urls.sendMobileVerifyCode,
          data: {
            mobile: this.mobile
          },
          success: res => {
            let data = res.data;

            if ( data.code === codes.SUCCESS ) {
              let sed = 60;
              let ms = 1000;
              let time;

              time = setInterval( () => {
                sed -= 1;

                if ( sed === 0 ) {
                  clearInterval( time );
                  this.codeText = '获取验证码';
                  this.isWait = false;
                } else {
                  this.codeText = `${sed}秒，等待中...`;
                  this.isWait = true;
                }
              }, ms );
            } else {
              this.$message( {
                message: data.msg,
                type: 'error'
              } );
            }
          }
        } );
      }
    },

    // todo: 检测手机号
    checkPhone( evt ) {
      let target = evt.target;

      console.log( this );
      if ( target.value.length !== 11 ) {
        this.$message( {
          message: '请输入正确的手机号码!',
          type: 'error'
        } );
      }
    },

    // todo: 检测密码
    checkPassword() {
      this.password !== this.comfirmPassword && this.$message( {
        message: '二次输入的密码不正确！',
        type: 'error'
      } );
    },

    // todo: 注册
    register() {
      ajax.post( {
        url: urls.finishRegisterByMobile,
        data: {
          mobile: this.mobile,
          password: this.password,
          verifyCode: this.code
        },
        success: res => {
          let ms = 1000;
          let data = res.data;

          if ( data.code === codes.SUCCESS ) {
            this.$message( {
              message: data.msg,
              type: 'success'
            } );

            setTimeout( () => {
              this.$router.push( '/success/register' );
            }, ms );
          } else {
            this.$message( {
              message: data.msg,
              type: 'error'
            } );
          }
        }
      } );
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
            cursor pointer
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
          cursor pointer
</style>