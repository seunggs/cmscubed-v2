import config from '../../client-config'
import io from 'socket.io-client'

const socket = io.connect(config.host + ':' + config.port)

export const requestRouteContent = contentRequestObj => {
  socket.emit('routeContent:get', contentRequestObj)
}

export default socket
