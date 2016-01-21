import App from './containers/App'

module.exports = {
  path: 'app',
  getComponent(location, cb) {
    require.ensure([], (require) => {
      cb(null, App)
    })
  }
}
