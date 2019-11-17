export default {
  // todo: 修改用户登录信息
  changeUser( state, options ) {
    const session = window.sessionStorage;

    session.setItem( 'user', JSON.stringify( options ) );
    state.user = {
      name: options.name,
      header: options.pic1,
      isLogin: options.isLogin
    };
  }
};
