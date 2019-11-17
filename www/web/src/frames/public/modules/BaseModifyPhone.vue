<template lang="jade">
  #modify-phone
    ul
      li
        span 密码
        input.pwd( type="password" v-model="pwd" )
      li
        span 新手机号
        input.phone( type="number" v-model="mobile" )
      li
        span 验证码
        input.code( type="text" placeholder="请输入验证码" v-model="code" )
        span.getCode( @click="getCode" ) 获取验证码
    span.ok( @click="done" ) 完成
</template>

<script>
  import { 
    changeMobile, 
    sendMobileVerifyCode
  } from '@/core/api';

  export default {
    name: 'modifyPhone',
    data() {
      return {
        pwd: '',
        code: '',
        mobile: ''
      }
    },
    methods: {
      done() {
        changeMobile( {
          data: {
            userID: this.getUserID(),
            pwd: this.pwd,
            newMobile: this.mobile,
            verifyCode: this.code
          }
        } ).then( data => {
          this.$message( {
            message: data.msg,
            type: 'success'
          } );
        } );
      },

      getCode() {
        sendMobileVerifyCode( {
          data: {
            mobile: this.mobile
          }
        } ).then( data => {
          this.$message( {
            message: data.msg,
            type: 'success'
          } );
        } );
      }
    }
  }
</script>

<style lang="stylus" scoped>
  #modify-phone
    padding-top 40px
    ul
      overflow hidden
      li
        margin-bottom 19px
        span
          display inline-block
          width 86px
          margin-right 20px
          color #666
          font-size 14px
          text-align right
        em
          font-size 14px
          color #333
        input
          width 280px
          height 40px
          padding-left 16px
          border: 1px solid #C5C6D6
          font-size 14px
          color #999
        .code
          border-right none
        .phone
        .pwd
          width 400px
        .getCode
          display inline-block
          background #E8E9F1
          width 120px
          height 40px
          line-height 40px
          vertical-align bottom
          border 1px solid #C5C6D6
          font-size 14px
          color #444B9C
          text-align center
          cursor pointer
    .next
    .ok
      display block
      background #2D316C
      width 130px
      height 40px
      line-height 40px
      margin-left 106px
      text-align center
      font-size 14px
      color #fff
      cursor pointer
</style>