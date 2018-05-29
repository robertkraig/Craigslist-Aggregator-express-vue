import filter from 'lodash/filter'
import axios from 'axios/index'
import map from 'lodash/map'
import each from 'lodash/each'

const buildAreaList = (areaList) => {
  let proxyArea = []
  each(areaList, function (state) {
    each(state, function (rec) {
      rec.selected = false
      proxyArea.push(rec)
    })
  })
  return proxyArea
}

export default {
  submitSearch: async ({commit, state}, data) => {
    commit('runningSearch')

    let {form} = data

    let submitData = Object.assign({

      include: map(filter(state.confData.areaList, {
        selected: true
      }), obj => obj.partial),

      regions: map(filter(state.confData.regionList, {
        selected: true
      }), obj => obj.type)
    }, form)

    submitData = {
      ...submitData,
      site: state.site
    }

    let results = await axios.post('/api/sites/fetch', submitData, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    let {searchResults} = results.data

    commit('updateSearchData', searchResults)
  },

  fetchConfig: async ({commit, state}, site) => {
    let newSite = site || state.site

    commit('runningConfUpdate')
    commit('changeSite', newSite)

    let confInit = await axios.get('/api/site/init', {
      params: {
        site: newSite
      }
    })

    let {title, pageTitle, searchExample} = confInit.data

    commit('updateConfData', {
      title,
      pageTitle,
      searchExample
    })

    let confData = await axios.get('/api/sites/conf', {
      params: {
        site: newSite
      }
    })

    let {fields, areaList, regionList} = confData.data

    let form = {}
    each(fields, (field) => {
      switch (field.argType) {
        case 'text':
        case 'radio':
          form[field['argName']] = ''
          break

        case 'checkbox':
          form[field['checkbox']['arg_name']] = ''
          break
      }
    })

    each(regionList, (region) => {
      region.selected = false
    })

    commit('updateConfData', {
      form: {
        site: newSite,
        ...form
      },
      fields,
      areaList: buildAreaList(areaList),
      regionList
    })

    commit('completedConfUpdate')
  }
}
