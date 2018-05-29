let Scraper = require('../lib/Scraper')
let ReadConfig = require('../lib/ReadConfig')

let data = {
  'include': ['imperial.craigslist.org', 'inlandempire.craigslist.org', 'losangeles.craigslist.org', 'orangecounty.craigslist.org', 'palmsprings.craigslist.org', 'sandiego.craigslist.org', 'ventura.craigslist.org'],
  'regions': ['socal'],
  'query': 'php',
  'srchType': 'A',
  'site': 'jobs'
}

let run = async () => {
  let site = 'findjobs'
  let conf = new ReadConfig(`../sites/${site}.locations.xml`)
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
