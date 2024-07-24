import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layout/AppLayout.vue'
import store from '@/store'
import { getUserInfo } from '@/services/userService'

const routes = [
  {
    path: '/',
    name: 'login',
    component: () => import('@/views/auth/Login.vue')
  },
  {
    path: '/dashboard',
    component: AppLayout,
    meta: { requiresAuth: true, roles: ['administrador', 'operador', 'supervisor'] },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true, roles: ['administrador', 'operador', 'supervisor'] }
      },
      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('@/views/pages/Perfil.vue'),
        meta: { requiresAuth: true, roles: ['administrador', 'operador', 'supervisor'] }
      },
      {
        path: 'registrar-atencion',
        name: 'registrar-atencion',
        component: () => import('@/views/pages/RegistrarAtencion.vue'),
        meta: { requiresAuth: true, roles: ['operador', 'supervisor'] }
      },
      {
        path: 'ver-atenciones',
        name: 'ver-atenciones',
        component: () => import('@/views/pages/VerAtenciones.vue'),
        meta: { requiresAuth: true, roles: ['operador', 'supervisor'] }
      },
      {
        path: 'preguntas-frecuentes',
        name: 'preguntas-frecuentes',
        component: () => import('@/views/pages/PreguntasFrecuentes.vue'),
        meta: { requiresAuth: true, roles: ['operador', 'supervisor'] }
      },
      {
        path: 'registrar-usuario',
        name: 'registrar-usuario',
        component: () => import('@/views/pages/RegistrarUsuario.vue'),
        meta: { requiresAuth: true, roles: ['administrador'] }
      },
      {
        path: 'ver-usuarios',
        name: 'ver-usuarios',
        component: () => import('@/views/pages/VerUsuarios.vue'),
        meta: { requiresAuth: true, roles: ['administrador'] }
      },
      {
        path: 'reportes',
        name: 'reportes',
        component: () => import('@/views/pages/Reportes.vue'),
        meta: { requiresAuth: true, roles: ['administrador'] }
      },
      {
        path: 'actividades',
        name: 'actividades',
        component: () => import('@/views/pages/Actividades.vue'),
        meta: { requiresAuth: true, roles: ['supervisor', 'administrador'] }
      },
      {
        path: 'ver-actividades',
        name: 'ver-actividades',
        component: () => import('@/views/pages/VerActividades.vue'),
        meta: { requiresAuth: true, roles: ['operador', 'supervisor'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      return next({ name: 'login' })
    } else {
      try {
        let user = store.state.user

        if (!user) {
          const response = await getUserInfo()
          user = response.data
          store.commit('setUser', user)
        }

        if (to.meta.roles && !to.meta.roles.includes(user.rol)) {
          return next({ name: 'dashboard' })
        }

        next()
      } catch (error) {
        localStorage.removeItem('token')
        next({ name: 'login' })
      }
    }
  } else {
    next()
  }
})

export default router
