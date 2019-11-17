import axios from 'axios';
import Qs from 'qs';

export default {
  get( params ) {
    axios.get(
      params.url,
      params.data
    ).then( data => {
      typeof params.success === 'function' && params.success( data );
    } ).catch( err => {
      console.error( 'err: ', err );
    } );
  },
  post( params ) {
    let type = '';
    let data;

    if ( params.type === 'json' ) {
      data = params.data;
    } else {
      data = Qs.stringify( params.data );
      type = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
    }

    axios.post(
      params.url,
      data,
      type
    ).then( data => {
      typeof params.success === 'function' && params.success( data );
    } ).catch( err => {
      console.error( 'err: ', err );
    } );
  }
}
;
