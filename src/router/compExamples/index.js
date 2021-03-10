/**
 * 组件实例
 */
export default [
  {
    path: '/datePickerStr',
    name: 'datePickerStr',
    component: (resolve) => {
      require(['../../views/compExamples/datePickerStr'], resolve)
    }
  },
  {
    path: '/remoteSelect',
    name: 'remoteSelect',
    component: (resolve) => {
      require(['../../views/compExamples/remoteSelect'], resolve)
    }
  },
]