import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from './store'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

import routerConfig from './router'
import { components } from './components.js'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(ViewUI)

// 注册组件库
Object.keys(components).forEach(key => {
  Vue.use(components[key])
})

const router = new VueRouter(routerConfig)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
