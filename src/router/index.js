import Main from '../views/main'

import compExamples from './compExamples'

export default {
  routes: [
    {
      path: '/',
      // name: 'home',
      component: Main,
      children: [ ...compExamples ]
    }
  ]
};
