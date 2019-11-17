export default {
  // todo: 获取用户登录信息
  getUser( state ) {
    let user = JSON.parse( window.sessionStorage.getItem( 'user' ) );

    state.user = user || state.user;
    return state.user;
  }
};
