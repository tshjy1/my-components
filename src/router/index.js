import Main from '../views/main'

import compExamples from './compExamples'

export default {
  routes: [
    {
      path: '/',
      redirect: 'home'
    },
    {
      path: '/home',
      // name: 'home',
      component: Main,
      children: [
        {
          path: '/',
          name: 'home',
          component: (resolve) => {
            require(['../views/home'], resolve)
          }
        },
        ...compExamples
      ]
    }
  ]
};
