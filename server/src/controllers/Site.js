
let ReadConf = require('../lib/ReadConfig')
let Scraper = require('../lib/Scraper')

const sites = [
  'findstuff',
  'findjobs',
  'findgigs',
  'findplaces',
  'findservices'
]

const validateSite = (req, res) => {
  let site = req.query['site'] || 'findjobs'

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

    let conf = new ReadConf(`../sites/${site}.locations.xml`)
    await conf.loadData()

    let info = conf.getInfo()

    res.send({
      title: info['title'],
      pageTitle: info['pagetitle'],
      searchExample: info['pagesearchexample']
    })
  },

  async postSiteFetch (req, res) {
    let site = validateSite(req, res)
    if (site === false) { return }

    let include = req.body.include || false

    let conf = new ReadConf(`../sites/${site}.locations.xml`)
    await conf.loadData()
    let fields = conf.getFields()
    let locations = conf.getLocations()
    let searchField = req.body[fields[0]['argName']] || false

    if (searchField === false) {
      res.statusCode(500)
      res.send({message: 'Search Field Not Set'})
      return
    }

    let scraper = new Scraper(req.body, include, locations, fields)
    let results = await scraper.fetchData()
    res.send({searchResults: results})
  },

  async getSiteConf (req, res) {
    let site = validateSite(req, res)
    if (site === false) { return }

    let conf = new ReadConf(`../sites/${site}.locations.xml`)
    await conf.loadData()

    res.send({
      pageInfo: conf.getInfo(),
      regionList: conf.getRegions(),
      areaList: conf.getAreas(),
      fields: conf.getFieldsArray()
    })
  }
}
