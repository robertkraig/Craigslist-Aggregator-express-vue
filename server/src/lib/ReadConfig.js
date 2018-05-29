let fsReadFilePromise = require('fs-readfile-promise')
let xml2js = require('xml2js-es6-promise')
let sortObj = require('sort-object')

const getInfo = (obj) => {
  return obj['clrepo']['info'][0]
}

const getFields = (obj) => {
  return obj['clrepo']['info']['fields']['argField']
}

const getFieldsArray = (obj) => {
  let fields = getFields(obj)

  return fields.map((field) => {
    if (['int', 'string'].indexOf(field['argType']) !== -1) {
      field['argType'] = 'text'
    } else if (field['argType'] === 'radio') {
      let argList = field['argTitle'].split(':')
      let title = argList[0].split('|')
      let args = argList[1].split('|')
      let select = argList[2].split('|')

      field['radios'] = []
      delete field['argId']
      delete field['argKey']
      delete field['argTitle']
      for (let i = 0; i < title.length; i++) {
        fields['radios'].push({
          checked: select[i] === '1',
          arg_name: title[i],
          arg_name_id: title[i].replace(/ /g, '_'),
          arg: args[i]
        })
      }
    } else if (field['argType'] === 'checkbox') {
      let argList = field['argTitle'].split(':')
      let title = argList[0]
      let value = argList[1]
      let argName = field['argName'].replace(/ /g, '_')

      delete field['argId']
      delete field['argKey']
      delete field['argName']
      delete field['argTitle']

      field['checkbox'] = {
        title: title,
        value: value,
        argName: argName
      }
    }
    return field
  })
}

const getAreas = (obj) => {
  let locations = Object.assign([], obj['clrepo']['locations'][0]['location'])
  let areas = {}

  locations.sort(function (a, b) {
    if (a['state'] === b['state']) { return a['name'] > b['name'] ? 1 : -1 } else { return a['name'] > b['name'] ? 1 : -1 }
  })

  locations.forEach((value) => {
    if (!areas[value['state']]) { areas[value['state']] = [] }

    areas[value['state']].push({
      type: value['type'],
      partial: value['partial'],
      name: `${value['name']}`.toUpperCase(),
      state: value['state']
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
      type: region['type'],
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
