import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store/index.js'
import axios from 'axios'
import { errorHandler } from '../util/errors'
import Landing from '../views/Landing.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Instructions from '../views/Instructions.vue'
import Profile from '../views/Profile.vue'
import Forgot from '../views/Forgot.vue'
import Reset from '../views/Reset.vue'
import Transfers from '../views/Transfers.vue'
import Index from '../views/Index.vue'
import Template from '../views/Template.vue'
import NotFound from '../views/NotFound.vue'
import Construction from '../views/Construction.vue'



Vue.use(VueRouter)


const routes = [
  {
    path: '/',
    name: 'Landing',
    component: Landing
  },
  {
    path: '/login/:msg?',
    name: 'Login',
    props: true,
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/instructions',
    name: 'Instructions',
    component: Instructions
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/forgot',
    name: 'Forgot',
    component: Forgot
  },
  {
    path: '/reset/:token',
    name: 'Reset',
    props: true,
    component: Reset
  },
  {
    path: '/transfers',
    name: 'Transfers',
    component: Transfers,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/index/:templateType(header|doc)/:msg?',
    name: 'Index',
    props: true,
    component: Index,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '/:templateType(header|doc)/:id?',
    name: 'Template',
    props: true,
    component: Template,
    meta: { 
      requiresAuth: true 
    }
  },
  {
    path: '*',
    name: 'NotFound',
    component: NotFound
  },
  {
    path: '/construction',
    name: 'Construction',
    component: Construction
  }
]


const router = new VueRouter({
  mode: 'history',
  routes
})


router.beforeEach(async (to, from, next) => {
  
  let errMsg = null

  try {
    const user = await axios.get('/api/user/')
    store.dispatch('setUser', user.data)
  } catch(err) {
    store.dispatch('setUser', null)
    errMsg = errorHandler(err).message
  }    

  if (to.name === 'Instructions' || 
      to.name === 'NotFound' ||

      //to auth pages and user authenticated, ok
      to.matched.some(record => record.meta.requiresAuth) && store.getters.user ||

      //to public pages and user unauthenticated, ok
      !to.matched.some(record => record.meta.requiresAuth) && !store.getters.user) {
      
      next()

  //to auth pages and user unauthenticated, go back to login with unauthenticated error message
  } else if (to.matched.some(record => record.meta.requiresAuth) && !store.getters.user) {
    next({ name: 'Login', params: { msg: { text: errMsg, context: 'danger' }}})
  
  //to public pages and user authenticated, go to main transfer page
  } else if (!to.matched.some(record => record.meta.requiresAuth) && store.getters.user && to.name !== 'NotFound') {
    next({ name: 'Transfers' })
  } 
})


export default router



