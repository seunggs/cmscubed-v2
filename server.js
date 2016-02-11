import path from 'path'
import express from 'express'
import {Server} from 'http'
import config from './server-config'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import routes from './server/routes'
import socketIo from 'socket.io'
import websockets from './server/websockets/'
import {getRouteContentFromDB, getPageContentFromDB} from './server/utils/db'
import {convertDBContentObjsToContent} from './modules/core/content'

const app = express()
const server = Server(app)
export const io = socketIo(server) // make io available to other modules

// establish socket.io connection and send initial content
io.on('connection', socket => {
  console.log('User connected')
  getRouteContentFromDB('/')
    .then(dbContentObjs => {
      const content = convertDBContentObjsToContent(dbContentObjs)
      socket.emit('routeContent:fromDB', content)
    })
})

// set up express
app.use(morgan('dev')) // log every request to the console
app.use(bodyParser.json())
app.use(bodyParser.json({type: 'application/vnd.api+json'}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('X-HTTP-Method-Override'))
app.use(express.static(__dirname))

// set up router
app.use('/', routes);

// run websocket related observable subscribers
websockets()

server.listen(config.port, config.host, () => console.log(`Listening on ${config.port}`))
