import each from 'lodash/each'

export default {
  changeSite (state, site) {
    state.site = site
  },
  runningSearch (state) {
    state.isSearchLoading = true
  },
  updateSearchData (state, newState) {
    state.isSearchLoading = false
    state.searchData = Object.assign([], newState)
  },
  runningConfUpdate (state) {
    state.isConfLoaded = false
  },
  updateConfData (state, newState) {
    state.confData = Object.assign(state.confData, newState)
  },
  completedConfUpdate (state) {
    state.isConfLoaded = true
  },
  toggleAreaList (state) {
    state.isAreaListOpen = !state.isAreaListOpen
  },
  toggleRegionList (state) {
    state.isRegionListOpen = !state.isRegionListOpen
  },
  updateRegionSelection (state, region) {
    let selected = !region.selected
    let index = state.confData.region_list.indexOf(region)
    let oldState = state.confData.region_list[index]

    state.confData.region_list.splice(index, 1, Object.assign({}, {
      ...oldState,
      selected
    }))

    each(state.confData.areaList, (obj, idx) => {
      if (obj.type === region.type) {
        state.confData.areaList.splice(idx, 1, Object.assign({}, {
          ...obj,
          selected
        }))
      }
    })
  },
  updateAreaSelection (state, area) {
    let selected = !area.selected
    let index = state.confData.areaList.indexOf(area)
    let oldState = state.confData.areaList[index]

    state.confData.areaList.splice(index, Object.assign({}, {
      ...oldState,
      selected
    }))
  }
}
