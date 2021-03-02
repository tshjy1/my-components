import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

import datePicker from '../packages/datePicker/index'

Vue.config.productionTip = false

Vue.use(ViewUI)

// 注册组件库
Vue.use(datePicker)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
