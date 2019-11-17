<template lang="jade">
  header.header
    span.title 久隆商贸欢迎您
    .info( v-if="isLogin" )
      .item
        el-dropdown( trigger="click", placement="bottom-start", @command="logout" )
          span.el-dropdown-link {{name}}
            i.el-icon-arrow-down.el-icon--right
          el-dropdown-menu( slot="dropdown" )
            el-dropdown-item 退出
      .item
        router-link.my-order( to="/personal/orderlist" )
          span 我的订单
      .item
        router-link( :to="{path: '/cart'}" )
          span 购物车
        em {{cartNum}}
</template>

<script>
import { mapState } from 'vuex';
import codes from '@/units/CONFIG/codes';
import urls from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';

export default {
  name: 'Head',
  computed: {
    ...mapState( {
      cartNum: state => state.cartNum,
      isLogin: state => state.user.isLogin,
      name: state => state.user.name
    } )
  },
  mounted() {
    let user = this.$store.getters.getUser;

    // todo: 判断用户是否登录过，如果关闭浏览器认为退出登录
    if ( !user.isLogin ) {
      this.$router.push( {
        path: '/login'
      } );
    }
  },
  methods: {
    // todo: 用户退出登录
    logout() {
      ajax.post( {
        url: urls.logout,
        data: {
          userID: this.$store.getters.getUser.userID
        },
        success: res => {
          const data = res.data;
          console.log( res );
          if ( data.code === codes.SUCCESS ) {
            this.$store.dispatch( 'changeUser', {
              name: '',
              isLogin: false
            } ).then( () => {
              window.sessionStorage.removeItem( 'user' );
              this.$router.push( {
                path: '/login'
              } );
            } );
          }
        }
      } );
    }
  }
};
</script>

<style lang="stylus" scoped>
  .header
    position: relative
    display flex
    align-items center
    justify-content space-between
    background: #000
    height: 40px
    line-height normal
    width auto
    padding-left 310px
    padding-right 204px
    font-size: 14px
    .title
      color: #ffffff
    .info
      display: flex
      color: #ffffff
      .item
        padding: 0 39px
        border-right 1px solid #808080
        &:last-child
          position: relative
          border-right 0
          em
            background: #ff2a44
            position: absolute
            top: -5px
            right: 30px
            width: 17px
            height: 17px
            line-height: 17px
            border-radius 10px
            text-align: center
            color: #ffffff
            font-size 12px
            font-style normal
        span
          cursor: pointer
          color: #ffffff
</style>
