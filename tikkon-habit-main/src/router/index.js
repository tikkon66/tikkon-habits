import { createRouter, createWebHashHistory } from 'vue-router' // Убрали лишнее
import { auth } from '@/firebase'

const routes = [
  { path: '/', redirect: '/focus' },
  { path: '/login', component: () => import('@/views/LoginView.vue'), meta: { public: true } },
  { path: '/focus', component: () => import('@/views/FocusView.vue'), meta: { requiresAuth: true } },
  { path: '/lists', component: () => import('@/views/ListsView.vue'), meta: { requiresAuth: true } },
  { path: '/year', component: () => import('@/views/YearView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  // Получаем текущего пользователя напрямую из Firebase
  const user = auth.currentUser;

  if (requiresAuth && !user) {
    // Если страница требует авторизации, а юзера нет — на логин
    next('/login');
  } else if (to.path === '/login' && user) {
    // Если юзер залогинен и лезет на страницу логина — на главную
    next('/focus');
  } else {
    next();
  }
});

export default router
