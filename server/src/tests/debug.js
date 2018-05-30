let Scraper = require('../lib/Scraper')
let ReadConfig = require('../lib/ReadConfig')
let path = require('path')

let data = {
  'include': ['inlandempire.craigslist.org', 'losangeles.craigslist.org', 'orangecounty.craigslist.org', 'sandiego.craigslist.org'],
  'regions': ['socal'],
  'query': 'php',
  'srchType': 'A',
  'site': 'jobs'
}

let run = async () => {
  let site = 'findjobs'
  let filePath = path.resolve(__dirname, `../sites/${site}.locations.xml`)
  let conf = new ReadConfig(filePath)
  await conf.loadData()
  let info = conf.getInfo()
  let regions = conf.getRegions()
  let areas = conf.getAreas()
  let locations = conf.getLocations()
  let fields = conf.getFields()
  console.log(info, 'info')
  console.log(regions, 'regions')
  console.log(areas, 'areas')
  console.log(locations, 'locations')
  let scraper = new Scraper(data, data['include'], locations, fields)
  let clData = await scraper.fetchData()
  console.log('fetched', clData)
}

run()
