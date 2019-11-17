/**
 * Created by ryan.zhu on 2017/11/7.
 　......(\_/)
 　　......( '_')
 　　..../"NOBUG"\======░ ▒▓▓█D
 　　/"""""""""""""""""""\
 　　\_@_@_@_@_@_@_@/
 */

import hotcss from '::libs/hotcss/CalculatesPage.js'
import Vue from 'vue'
import mix from './mix.vue'
import router from './router/mix'
import store from './store/store_main'
import ElementUI from 'element-ui'
//import 'element-ui/lib/theme-default/index.css'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false;

Vue.use(ElementUI);

new Vue({
    el: '#mix',
    router,
    store,
    template: '<mix/>',
    components: { mix }
});

