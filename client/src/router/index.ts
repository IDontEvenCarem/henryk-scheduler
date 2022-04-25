import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import AboutViewVue from '@/views/AboutView.vue'
import TodosViewVue from '@/views/TodosView.vue'
import RegisterViewVue from '@/views/RegisterView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterViewVue
    },
    {
      path: '/about',
      name: 'about',
      component: AboutViewVue
    },
    {
      path: '/todos',
      name: 'todo',
      component: TodosViewVue
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue')
    },
    {
      path: '/notes/list',
      name: 'noteList',
      component: () => import('@/views/notes/NoteListView.vue'),
    },
    {
      path: '/notes/create',
      name: 'noteCreate',
      component: () => import('@/views/notes/NoteCreateView.vue'),
    },
    {
      path: '/notes/edit/:id',
      name: 'noteEdit',
      component: () => import('@/views/notes/NoteCreateView.vue'),
    },
    {
      path: '/notes/view/:id',
      name: 'noteView',
      component: () => import('@/views/notes/NoteView.vue')
    }
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
