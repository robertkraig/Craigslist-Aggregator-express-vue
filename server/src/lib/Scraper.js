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
      location: location['partial'][0],
      date: item['dc:date'][0],
      source: item['dc:source'][0],
      title: item['dc:title'][0]
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

  // console.log(data);

  let regroupList = {}
  let dataKeys = Object.keys(data)
  dataKeys.forEach((timestamp) => {
    let _data = data[timestamp]
    try {
      let date = new Date(parseInt(timestamp))
      let hashGroup = dateformat(date, 'isoDate')
      if(!regroupList[hashGroup]) {regroupList[hashGroup] = {}}
      regroupList[hashGroup]['timestamp'] = timestamp
      regroupList[hashGroup]['date'] = dateformat(date, 'longDate')
      if(!regroupList[hashGroup]['records']) { regroupList[hashGroup]['records'] = {} }
      regroupList[hashGroup]['records'][_data['location']] = [_data]
    } catch (error) {
      console.log(error, timestamp)
    }
  })

  let flattenArray = Object.values(regroupList);
  flattenArray.sort(function (a, b) {
      if (a['timestamp'] === b['timestamp']) { return 0 }

      return a['timestamp'] > b['timestamp'] ? 1 : -1
  });

  return flattenArray.reverse();
}

/**
 *
 * @param {Object} location
 * @param {Object} headers
 * @returns {Promise<*>}
 */
let getRecords = async (location, headers) => {
  let content = await Utils.getFileCache(location['url'], headers)
  if (content === false) { return [] }
  let xmlParsedData = await parseXml(content, location)
  return xmlParsedData;
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
  async fetchData (req) {
    let includeStr = this.include.map((val) => {
      return val.replace(/\./g, '\\.').replace(/\+/g, '(.+)')
    }).join('|')

    let locations = AppendAndBuildSearchQuery(this.requestConf, this.fields, this.locations)
    let testRegex = new RegExp(`(${includeStr})`)
    for (let idx in locations) {
      let location = locations[idx]
      if (testRegex.test(location['url'])) {
        let list = await getRecords(location, req.headers)
        this.recordList = this.recordList.concat(list)
      }
    }

    return processDataToJson(this.recordList);
  }
}

module.exports = Scraper
