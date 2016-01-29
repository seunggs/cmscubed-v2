import config from '../config/'

export default io.connect(config.host + ':' + config.port)
