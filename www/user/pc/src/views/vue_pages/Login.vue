<template lang="jade">
  #login
    .top
      Logo
      //-Search
    main.main
      img.img( :src="src" )
      .login-area
        h3.title
          span 登录
          span.no-login
            | 没有帐号？
            a( href="#" ) 立即注册
        .form
          input.name(ref='inputName',type="text",v-model:name='name')
          input.password(ref='inputPS',type="password",placeholder="填写您的登录密码",v-model:password='password')
          .auto-login
            .auto
              input( type="checkbox" id="auto" )
              label( for="auto" ) 自动登录
            a.forget-password( href="#" ) 忘记密码?
          a.login-active( @click='login' ) 登 录
</template>

<script>
  //-import Search from 'modules/Search.vue';
  import Logo from 'modules/Logo.vue';
  import URLS from '@/units/CONFIG/urls';
  import ajax from '@/units/core/AJAX';
  
  export default {
    name: 'index',
    components: {
      //-Search,
      Logo
    },
    data() {
      return {
        src: '13',
        name:'',
        password:''
      };
    },
    methods:{
      /*detail页添加到购物车*/
      login(result){
        let url = URLS.BaseURL+'/api/right/login';
        if(this.name===''){
          alert('请填写用户名或手机号');
          this.$refs.inputName.focus();
          return;
        }else if(this.password===''){
          alert('请填写用户密码');
          this.$refs.inputPS.focus();
          return;
        }
        ajax.post( {
            url: url,
            data: {
              accountID:this.name,
              password:this.password,
            },
            success: res => {
              console.log('login:',res);
              if(!res.data){
                console.warn('返回异常:',res.config.url)
                return;
              }
              if(String(res.data.code)==='0'){
                //alert(res.data.msg);
                this.$router.push('/')
              }else{
                alert(res.data.msg);
                console.warn(res.data.msg)
              }
            }
        } );
      }
    }
  };
</script>

<style lang="stylus" scoped>
  #login
    .top
      display: flex
      align-items: center
      justify-content: space-between
      border-bottom 1px solid #F0F3F5
      margin-right: 240px
      margin-left: 310px
    .main
      display: flex
      background: #f0f3f5
      justify-content: center
      padding-top: 111px
      padding-bottom: 168px
      .img
        width: 633px
        height: auto
      .login-area
        background: #fff
        width: 383px
        padding: 28px 42px 46px
        box-sizing: border-box
        .title
          display: flex
          justify-content: space-between
          width: 100%
          padding-bottom: 10px
          border-bottom: 1px solid #E8E9F1
          span
            display: inline-block
            color: #0E113A
            font-size: 18px
          .no-login
            font-weight: normal
            font-size: 14px
            color: #676767
      .form
        padding-top: 30px
        .name
        .password
          display: block
          background-repeat: no-repeat
          background-position: 10px center
          padding-left: 40px
          width: 260px
          height: 40px
          border: 1px solid #C5C6D6
          color: #0E113A
          font-size: 14px
        .name
          background-image: url( '~images/user.png' )
          margin-bottom: 20px
        .password
          background-image: url( '~images/code.png' )
          margin-bottom: 15px
          color: #999
        .auto-login
          display: flex
          justify-content: space-between;
          margin-bottom: 28px
          label
            margin-left: 5px
            color: #9B9B9B
            font-size: 14px
          a
            color: #444B9C
            font-size: 14px
        .login-active
          background-color: #2D316C
          display: block
          width: 300px
          height: 50px;
          line-height: 50px
          border-radius: 5px
          text-align: center
          font-size: 16px
          color: #fff
</style>