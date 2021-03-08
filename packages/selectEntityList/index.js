// 导入组件，组件必须声明 name
import SelectEntityList from './SelectEntityList.vue'

// 为组件提供 install 安装方法，供按需引入
SelectEntityList.install = function (Vue) {
  Vue.component(SelectEntityList.name, SelectEntityList)
}

// 默认导出组件
export default SelectEntityList