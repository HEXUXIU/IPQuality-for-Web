/*
 * =========================================================
 * IP 质量查询路由配置
 * 定义应用的所有路由路径和对应的组件
 * =========================================================
 */

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ResultView from '@/views/ResultView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'IP质量查询 - 首页'
    }
  },
  {
    path: '/result',
    name: 'result',
    component: ResultView,
    meta: {
      title: 'IP质量查询 - 结果'
    },
    props: route => ({ ip: route.query.ip })
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'IP质量查询'
  next()
})

export default router