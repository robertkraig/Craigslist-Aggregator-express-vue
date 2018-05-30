let fetch = require('node-fetch')

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min // The maximum is inclusive and the minimum is inclusive
}

let userAgents = [
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Win64; x64; Trident/5.0',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:15.0) Gecko/20120427 Firefox/15.0a1',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.1 (KHTML, like Gecko) Chrome/21.0.1180.89 Safari/537.1',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/536.6 (KHTML, like Gecko) Chrome/20.0.1092.0 Safari/536.6',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_0) AppleWebKit/536.3 (KHTML, like Gecko) Chrome/19.0.1063.0 Safari/536.3',
  'Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.00',
  'Opera/9.80 (X11; Linux x86_64; U; fr) Presto/2.9.168 Version/11.50'
]

/**
 *
 * @param {String} location
 * @param {Object} headers
 * @returns {Promise<boolean>|String}
 */
let getFileCache = async (location, headers) => {
  console.debug('fetch', location)

  let randomHeaderUserAgent = null
  if (headers['user-agent']) {
    randomHeaderUserAgent = headers['user-agent']
  } else {
    randomHeaderUserAgent = userAgents[getRandomIntInclusive(0, userAgents.length)]
  }

  let results = await fetch(location, {
    method: 'GET',
    headers: {
      'User-Agent': randomHeaderUserAgent
    }
  })
  if (results.status !== 200) {
    return false
  }

  return results.text()
}

module.exports = {
  getFileCache: getFileCache
}
