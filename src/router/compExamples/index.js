/**
 * 组件实例
 */
export default [
  {
    path: '/',
    name: 'home',
    component: (resolve) => {
      require(['../../views/home'], resolve)
    }
  }
]