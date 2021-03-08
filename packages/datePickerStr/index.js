// 导入组件，组件必须声明 name
import datePickerStr from './datePickerStr.vue'

// 为组件提供 install 安装方法，供按需引入
datePickerStr.install = function (Vue) {
  Vue.component(datePickerStr.name, datePickerStr)
}

// 默认导出组件
export default datePickerStr