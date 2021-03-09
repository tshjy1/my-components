// 导入组件，组件必须声明 name
import RemoteSelect from './RemoteSelect.vue'

// 为组件提供 install 安装方法，供按需引入
RemoteSelect.install = function (Vue) {
  Vue.component(RemoteSelect.name, RemoteSelect)
}

// 默认导出组件
export default RemoteSelect