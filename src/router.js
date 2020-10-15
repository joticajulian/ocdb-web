import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/whitelist',
      name: 'whitelist',
      component: () => import('./views/Whitelist.vue')
    },
    {
      path: '/admins',
      name: 'admins',
      component: () => import('./views/Admins.vue')
    },
    {
      path: '/@:user',
      name: 'whitelist',
      component: () => import('./views/WhitelistUser.vue')
    },
    {
      path: '/history2',
      name: 'history2',
      component: () => import('./views/History2.vue')
    },
    {
      path: '/delegators',
      name: 'delegators',
      component: () => import('./views/Delegators.vue')
    }
  ]
})
