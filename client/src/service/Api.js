import axios from 'axios'

export default () => {
  return axios.create({
    baseURL: `http://clag.localhost/`,
    headers: {}
  })
}
