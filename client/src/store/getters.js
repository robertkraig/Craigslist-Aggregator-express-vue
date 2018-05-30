import filter from 'lodash/filter'

export default {
  getSearchData (state) {
    return state.searchData
  },
  getSections (state) {
    return state.sections
  },
  isAreaListOpen (state) {
    return state.isAreaListOpen
  },
  isRegionListOpen (state) {
    return state.isRegionListOpen
  },
  isSearchLoading (state) {
    return state.isSearchLoading
  },
  isConfLoaded (state) {
    return state.isConfLoaded
  },
  getPageTitle (state) {
    return state.confData.pagetitle
  },
  getSearchExample (state) {
    return state.confData.searchExample
  },
  getFormFields (state) {
    return state.confData.form
  },
  getFields (state) {
    return state.confData.fields
  },
  getRegionList (state) {
    return state.confData.regionList
  },
  getAreaList (state) {
    return state.confData.areaList
  },
  getSelectedAreas (state) {
    return filter(state.confData.areaList, {
      selected: true
    })
  },
  getUnselectedAreas (state) {
    return filter(state.confData.areaList, {
      selected: false
    })
  },
  getTotalAreas (state) {
    return filter(state.confData.areaList, {
      selected: true
    }).length
  }
}
