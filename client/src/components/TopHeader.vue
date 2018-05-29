<template>
  <nav id="header">
    <ul>
      <li v-for="name in getSections" :key="name">
        <router-link :to="{ path: `/s/${name}`, params:{section:name} }">{{capitalize(name)}}</router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  props: ['site'],
  computed: {
    ...mapGetters([
      'getSections'
    ])
  },
  methods: {
    capitalize (name) {
      let letters = name.split('')
      letters[0] = letters[0].toUpperCase()
      return letters.join('')
    }
  }
}
</script>
