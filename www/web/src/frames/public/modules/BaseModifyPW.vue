<template lang="jade">
  #modify-pw
    ul
      li
        span 旧密码
        input( type="password" v-model="oldPwd", ref="oldPwd" )
      li
        span 新密码
        input( type="password" v-model="newPwd" ref="newPwd" )
      li
        span 确认新密码
        input( type="password" v-model="confirmPwd" )
    span.save( @click="save" ) 保存
</template>

<script>
  import { modifyPwd } from '@/core/api';

  export default {
    name: 'modifyPassWord',
    data() {
      return {
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
      }
    },
    methods: {
      async save() {
        let message, type, res;

        if ( this.newPwd === this.confirmPwd ) {
          res = await modifyPwd( {
            data: {
              userID: this.getUserID(),
              oldPwd: this.oldPwd,
              newPwd: this.newPwd
            }
          } );
          if ( res ) {
            this.$router.push( {
              path: '/login'
            } );
            window.sessionStorage.removeItem( 'user' );
            message = res.msg;
            type = 'success';
          }
        } else {
          this.$refs.newPwd.focus();
          message = '二次输入的密码不一致，请重新输入！';
          type = 'error';
        }

        this.$message( {
          message,
          type
        } );
      }
    }
  }
</script>

<style lang="stylus" scoped>
  #modify-pw
    margin-top: 44px
    ul
      overflow: hidden
      li
        margin-bottom: 10px
        span
          display: inline-block
          width: 115px
          margin-right: 20px
          text-align: right
        input
          width 400px
          height 40px
          border 1px solid #C5C6D6
          padding-left 15px
          font-size 14px
          color #999
    .save
      display block
      background #2D316C
      width 131px
      height 40px
      margin-top 30px
      margin-left 135px
      line-height 40px
      text-align center
      color #fff
      font-size 14px
      cursor pointer
</style>