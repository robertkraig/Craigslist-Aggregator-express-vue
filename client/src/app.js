import Vue from 'vue'
import Layout from './Layout'
import router from './router'
import store from './store'

import './sass/app.scss'

export default new Vue({
  el: '#app',
  template: '<Layout />',
  mode: 'history',
  components: {
    Layout
  },
  router,
  store,
  mounted () {
    console.log('app.js vue mounted')
  }
})
