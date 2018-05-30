let fsReadFilePromise = require('fs-readfile-promise')
let xml2js = require('xml2js-es6-promise')
let sortObj = require('sort-object')

const getInfo = (obj) => {
  let info = obj['clrepo']['info'][0]
  return {
    title: info['title'][0],
    pageTitle: info['pagetitle'][0],
    searchExample: info['pagesearchexample'][0]
  }
}

const getFields = (obj) => {
  return obj['clrepo']['info'][0]['fields'][0]['argField']
}

const getFieldsArray = (obj) => {
  let fields = getFields(obj)

  return fields.map((field) => {

    let tmp = {};

    let argType = field['argType'][0];
    let argTitle = field['argTitle'][0];
    let fieldArgName = field['argName'][0];

    tmp['argName'] = fieldArgName;

    if (['int', 'string'].indexOf(argType) !== -1) {
      tmp['argTitle'] = argTitle
      tmp['argType'] = 'text'
    } else if (argType === 'radio') {
      let argList = argTitle.split(':')
      let title = argList[0].split('|')
      let args = argList[1].split('|')
      let select = argList[2].split('|')

        tmp['argType'] = argType
        tmp['radios'] = []
      for (let i = 0; i < title.length; i++) {
          tmp['radios'].push({
          checked: select[i] === '1',
          argName: title[i],
          argNameId: title[i].replace(/ /g, '_'),
          arg: args[i]
        })
      }
    } else if (argType === 'checkbox') {
      let argList = argTitle.split(':')
      let title = argList[0]
      let value = argList[1]

      tmp['argType'] = argType
      tmp['checkbox'] = {
        title: title,
        value: value,
        argName: fieldArgName.replace(/ /g, '_')
      }
    }
    return tmp
  })
}

const getAreas = (obj) => {
  let locations = Object.assign([], obj['clrepo']['locations'][0]['location'])
  let areas = {}

  locations.sort(function (a, b) {
    let stateA = a['state'][0];
    let stateB = b['state'][0];

    let nameA = a['name'][0];
    let nameB = b['name'][0];

    if (stateA === stateB) { return nameA > nameB ? 1 : -1 } else { return stateA > stateB ? 1 : -1 }
  })

  locations.forEach((value) => {
    let state = value['state'][0];
    if (!areas[state]) { areas[state] = [] }

    areas[state].push({
      type: value['type'][0],
      partial: value['partial'][0],
      name: `${value['name']}`.toUpperCase(),
      state: value['state'][0]
    })
  })

  areas = sortObj(areas)

  return {
    locations: locations,
    areas: areas
  }
}

const getRegions = (obj) => {
  let regions = Object.assign([], obj['clrepo']['regions'][0]['region'])

  regions.sort(function (a, b) {
    return a['name'] > b['name'] ? 1 : -1
  })

  return regions.map((region) => {
    return {
      type: region['type'][0],
      name: `${region['name']}`.toUpperCase()
    }
  })
}

class ReadConfig {
  constructor (fileName) {
    this.fileName = fileName
    this.info = null
    this.fields = null
    this.fieldsArray = null
    this.areas = null
    this.regions = null
    this.locations = null
    this.conf = null
  }

  getAreas () {
    if (this.areas === null) {
      let obj = getAreas(this.conf)
      this.areas = obj.areas
      this.locations = obj.locations
    }

    return this.areas
  }

  getLocations () {
    if (this.locations === null) {
      let obj = getAreas(this.conf)
      this.areas = obj.areas
      this.locations = obj.locations
    }

    return this.locations
  }

  getRegions () {
    if (this.regions === null) {
      this.regions = getRegions(this.conf)
    }

    return this.regions
  }

  getFields () {
    if (this.fields === null) { this.fields = getFields(this.conf) }

    return this.fields
  }

  getFieldsArray () {
    if (this.fieldsArray === null) { this.fieldsArray = getFieldsArray(this.conf) }

    return this.fieldsArray
  }

  getInfo () {
    if (this.info === null) { this.info = getInfo(this.conf) }

    return this.info
  }

  async loadData () {
    if (this.conf === null) {
      let xmlConf = await fsReadFilePromise(this.fileName)
      this.conf = await xml2js(xmlConf)
    }
  }
}

module.exports = ReadConfig
