import CODES from '@/units/CONFIG/codes';
import URLS from '@/units/CONFIG/urls';
import ajax from '@/units/core/AJAX';

export default {
  getCartList( params ) {
    ajax.get( {
      url: URLS.CARTLIST,
      data: {
        params: {
          userID: '703d065b0b684ae9bf4fa3be67a4726c'
        }
      },
      success( res ) {
        let data = res.data;

        if ( data.code === CODES.SUCCESS ) {
          params.$store.dispatch( 'changeCartNum', {
            num: data.result.length
          } );
          params.$store.dispatch( 'changeCartItems', data.result );
          typeof params.success === 'function' && params.success( data );
        }
      }
    } );
  }
};
