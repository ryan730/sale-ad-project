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
    axios.post(
      params.url,
      Qs.stringify( params.data ),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).then( data => {
      typeof params.success === 'function' && params.success( data );
    } ).catch( err => {
      console.error( 'err: ', err );
    } );
  }
}
;
