// 导入组件，组件必须声明 name
import RPTree from './RPTree.vue'

// 为组件提供 install 安装方法，供按需引入
RPTree.install = function (Vue) {
  Vue.component(RPTree.name, RPTree)
}

// 默认导出组件
export default RPTree