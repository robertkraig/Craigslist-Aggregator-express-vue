const Site = require('./controllers/Site');


module.exports = (app) => {
    app.get('/api/init', Site.initConf)
    app.post('/api/sites/fetch', Site.postSiteFetch)
    app.get('/api/sites/conf', Site.getSiteConf)
};