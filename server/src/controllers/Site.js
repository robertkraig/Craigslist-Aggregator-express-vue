module.exports = {
  async initConf (req, res) {
    res.send({message: 'initConf'})
  },
  async postSiteFetch (req, res) {
    res.send({message: 'postSiteFetch'})
  },
  async getSiteConf (req, res) {
    res.send({message: 'getSiteConf'})
  }
}
