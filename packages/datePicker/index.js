// 导入组件，组件必须声明 name
import datePicker from './datePicker.vue'

// 为组件提供 install 安装方法，供按需引入
datePicker.install = function (Vue) {
  Vue.component(datePicker.name, datePicker)
}

// 默认导出组件
export default datePicker