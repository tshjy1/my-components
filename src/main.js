import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import store from './store'
import VUEi18 from 'vue-i18n'

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

import routerConfig from './router'
import { components } from './components.js'
import langSource from './lang/index'
import { http } from './utils/http'

Vue.use(VUEi18)

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(ViewUI)

// 注册组件库
Object.keys(components).forEach(key => {
  Vue.use(components[key])
})

const router = new VueRouter(routerConfig)
const messages = {
  'LANG-CN': langSource['LANG-CN'],
  'LANG-TRZH': langSource['LANG-TRZH'],
  'LANG-US': langSource['LANG-US'],
  'LANG-JA': langSource['LANG-JA'],
}
const i18n = new VUEi18({
  locale: localStorage.getItem('lang') || 'LANG-CN',
  messages
})

window.$http = http
window.$store = store
window.$app = new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
