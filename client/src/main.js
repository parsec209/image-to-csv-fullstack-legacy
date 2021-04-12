import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as Sentry from '@sentry/vue';
import { Integrations } from '@sentry/tracing';



Sentry.init({        
  Vue, 
  dsn: process.env.VUE_APP_SENTRY_DSN,
  // logErrors: true,
  // debug: true,
  tracingOptions: {
    trackComponents: true,
  },
  integrations: [
    new Integrations.BrowserTracing()
  ],
  tracesSampleRate: 0.2  
});


Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
