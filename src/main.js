// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import 'vuetify/dist/vuetify.min.css'

Vue.config.productionTip = false
Vue.use(Vuetify);

Vue.use(Vuetify, {
  theme: {
    primary: '#6ed3cf',
    secondary: '#9068be',
    accent: '#e62739',
    light: '#e1e8f0',
    dark: '#2B303A'
  }
});

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});
