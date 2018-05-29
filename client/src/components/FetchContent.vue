<template>
  <div id="content-container">
    <div id="link_content">
      <div v-if="isSearchLoading">...Loading</div>
      <div v-if="!isSearchLoading">
        <section v-for="(dates, dIdx) in getSearchData" :key="dIdx">
          <h1 v-html="dates.date"></h1>
          <div class="date">
            <article v-for="(records, location) in dates.records" :key="location">
              <h2 v-html="location"></h2>
              <ul class="locationItems">
                <li v-for="(rec, idx) in records" :key="idx">
                  <a class="jobsite" :title="rec.title" target="_blank" :href="rec.link">
                    <span v-html="rec.title"></span>
                  </a>
                </li>
              </ul>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapActions} from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'isSearchLoading',
      'getSearchData',
      'getSections'
    ])
  },
  methods: {
    ...mapActions([
      'fetchConfig'
    ])
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      let index = vm.getSections.indexOf(to.params.section)
      if (index === -1) {
        vm.$router.push({path: '/'})
        return
      }

      vm.fetchConfig(to.params.section)
    })
  },
  beforeRouteUpdate (to, from, next) {
    let index = this.getSections.indexOf(to.params.section)
    if (index === -1) {
      this.$router.push({path: '/'})
      return
    }

    this.fetchConfig(to.params.section)
    next()
  }
}

</script>
