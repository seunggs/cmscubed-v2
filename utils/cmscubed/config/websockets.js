import config from '../config/'
import io from 'socket.io-client'

const socket = io.connect(config.host + ':' + config.port)

export default socket
