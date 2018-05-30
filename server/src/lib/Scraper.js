let Utils = require('./Utils')
let xml2js = require('xml2js-es6-promise')
let sortObj = require('sort-object')
let dateformat = require('dateformat')

/**
 *
 * @param {Array} requestConf
 * @param {Array} fields
 * @param {Array} locationUrlParamsList
 * @returns {*|Array}
 * @private
 */
const AppendAndBuildSearchQuery = (requestConf, fields, locationUrlParamsList) => {
  locationUrlParamsList = locationUrlParamsList || []
  let tmpArray = {}
  fields = fields || []
  fields.forEach((field) => {
    if (requestConf[field['argName']]) {
      tmpArray[field['argName']] = requestConf[field['argName']]
    }
  })
  tmpArray['format'] = 'rss'

  let buildNewArgs = new URLSearchParams(tmpArray)
  let buildNewArgsStr = buildNewArgs.toString()
  locationUrlParamsList.forEach((value, key) => {
    locationUrlParamsList[key]['url'] += buildNewArgsStr
  })
  return locationUrlParamsList
}

/**
 *
 * @param {String} xml
 * @param {Object} location
 * @private
 */
const parseXml = async (xml, location) => {
  let xml2Obj = await xml2js(xml)

  let items = xml2Obj['rdf:RDF']['item'] || []
  return items.map((item) => {
    return {
      location: location['partial'],
      date: item['dc:date'],
      source: item['dc:source'],
      title: item['dc:title']
    }
  })
}

/**
 *
 * @param {Array} searchItems
 * @private
 */
const processDataToJson = async (searchItems) => {
  let data = {}
  searchItems.forEach((item) => {
    let date = item['date']
    let uniqueGroupHash = Date.parse(date)
    data[uniqueGroupHash] = item
  })

  data = sortObj(data, {
    sort: function (a, b) {
      if (a === b) { return 0 }

      return a > b ? 1 : -1
    }
  })

  // console.log(data);

  let regroupList = {}
  let dataKeys = Object.keys(data)
  dataKeys.forEach((timestamp) => {
    let _data = data[timestamp]
    try {
      let date = new Date(parseInt(timestamp))
      let hashGroup = dateformat(date, 'isoDate')
      regroupList[hashGroup] = {}
      regroupList[hashGroup]['timestamp'] = timestamp
      regroupList[hashGroup]['date'] = dateformat(date, 'longDate')
      regroupList[hashGroup]['records'] = {}
      regroupList[hashGroup]['records'][_data['location']] = [_data]
    } catch (error) {
      console.log(error, timestamp)
    }
  })

  return regroupList
}

/**
 *
 * @param {Object} location
 * @returns {Promise<*>}
 */
let getRecords = async (location) => {
  let content = await Utils.getFileCache(location['url'])
  let xmlParsedData = await parseXml(content, location)
  return processDataToJson(xmlParsedData)
}

class Scraper {
  /**
     *
     * @param {Array} requestConf
     * @param {Array} include
     * @param {Array} locations
     * @param {Array} fields
     */
  constructor (requestConf, include, locations, fields) {
    this.recordList = []
    this.requestConf = requestConf
    this.include = include
    this.locations = locations
    this.fields = fields
  }

  /**
     *
     * @returns {Promise<Array>}
     */
  async fetchData () {
    let includeStr = this.include.map((val) => {
      return val.replace(/\./g, '\\.').replace(/\+/g, '(.+)')
    }).join('|')

    let locations = AppendAndBuildSearchQuery(this.requestConf, this.fields, this.locations)
    let testRegex = new RegExp(`(${includeStr})`)
    for (let idx in locations) {
      let location = locations[idx]
      if (testRegex.test(location['url'])) {
        let list = await getRecords(location)
        this.recordList = this.recordList.concat(list)
      }
    }

    return this.recordList
  }
}

module.exports = Scraper
