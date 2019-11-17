import codes from '@/config/codes';
import axios from 'axios';
import Qs from 'qs';

export default ( params ) => {
  let config = {
    url: params.url || '',
    method: params.method ? params.method.toUpperCase() : 'GET',
    baseURL: params.baseURL || '',
    headers: ( () => {
      let header = {};

      switch ( params.type ) {
        case 'form':
          header = {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
          };
          break;
        case 'image':
          header = {
            'Content-Type': 'multipart/form-data'
          };
          break;
        default:
          header = {
            'Content-Type': 'application/json;charset=UTF-8'
          };
      }
      return header;
    } )()
  };

  if ( typeof params.data === 'object' ) {
    switch ( config.method ) {
      case 'GET':
        config.params = params.data;
        break;
      case 'POST':
        config.data = params.type === 'form'
          ? Qs.stringify( params.data )
          : params.data;
        break;
    }
  }

  return new Promise( ( resolve, reject ) => {
    axios( config )
      .then( res => {
        res.data.code === codes.SUCCESS
          ? resolve( res.data )
          : window.$vue.$message( {
            type: 'error',
            message: res.data.msg
          } );
      } )
      .catch( err => {
        reject( err );
      } );
  } );
};
