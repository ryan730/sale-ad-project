import codes from '@/units/CONFIG/codes';

export default function( params ) {
  if ( params.code === codes.noLogin ) {
    window.sessionStorage.removeItem( 'user' );
    params.$route.push( {
      path: '/login'
    } );
  }
};
