import axios from 'axios';
import Qs from 'qs';

axios.defaults.timeout = 10;

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
  // Do something with response data
  return response;
}, function (error) {
  // Do something with response error
  return Promise.reject(error);
});

export default {
  get(params) {
    axios.get(
      params.url,
      params.data,
      { timeout: 10 }
    ).then(data => {
      typeof params.success === 'function' && params.success(data);
    }).catch(err => {
      console.error('err: ', err);

      const { transFun } = require('@/mock/');
      console.log('get====', params,transFun(params));
      typeof params.success === 'function' && params.success(transFun(params));

    });
  },
  post(params) {
    axios.post(
      params.url,
      Qs.stringify(params.data),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).then(data => {
      typeof params.success === 'function' && params.success(data);
    }).catch(err => {
      console.error('err: ', err);
      const { transFun } = require('@/mock/');
      console.log('post====', params, transFun(params));
      typeof params.success === 'function' && params.success(transFun(params));
    });
  }
};
