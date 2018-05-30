
let ReadConf = require('../lib/ReadConfig')
let Scraper = require('../lib/Scraper')
let path = require('path')

const sites = [
  'findstuff',
  'findjobs',
  'findgigs',
  'findplaces',
  'findservices'
]

const validateSite = (req, res) => {
  let site = null
  if (req.query['site']) {
    site = req.query['site']
  } else if (req.body['site']) {
    site = req.body['site']
  } else {
    site = 'findjobs'
  }

  if (!/^find.*/.test(site)) { site = `find${site}` }

  if (sites.indexOf(site) === -1) {
    res.status(500).send({'status': false, 'message': 'site not defined'})
    return false
  }

  return site
}

module.exports = {

  async initConf (req, res) {
    let site = validateSite(req, res)
    if (site === false) { return }
    console.log('testing')

    let filePath = path.resolve(__dirname, `../sites/${site}.locations.xml`)
    let conf = new ReadConf(filePath)
    await conf.loadData()

    let info = conf.getInfo()

    res.send({
      title: info['title'],
      pageTitle: info['pageTitle'],
      searchExample: info['searchExample']
    })
  },

  async postSiteFetch (req, res) {
    let site = validateSite(req, res)
    if (site === false) { return }

    console.debug('body', req.body, req.headers)
    let include = (req.body.include || false)

    let filePath = path.resolve(__dirname, `../sites/${site}.locations.xml`)
    let conf = new ReadConf(filePath)
    await conf.loadData()
    let fields = conf.getFields()
    let locations = conf.getLocations()
    let searchField = req.body[fields[0]['argName']] || false

    if (searchField === false) {
      res.status(500)
      res.send({message: 'Search Field Not Set'})
      return
    }

    let scraper = new Scraper(req.body, include, locations, fields)
    let results = await scraper.fetchData(req)
    res.send({searchResults: results})
  },

  async getSiteConf (req, res) {
    let site = validateSite(req, res)
    if (site === false) { return }

    let filePath = path.resolve(__dirname, `../sites/${site}.locations.xml`)
    let conf = new ReadConf(filePath)
    await conf.loadData()

    res.send({
      pageInfo: conf.getInfo(),
      regionList: conf.getRegions(),
      areaList: conf.getAreas(),
      fields: conf.getFieldsArray()
    })
  }
}
