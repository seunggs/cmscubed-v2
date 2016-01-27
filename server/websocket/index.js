import socketIo from 'socket.io'

// temporary - get it from DB
const content = {
  heading: 'Home page',
  title: 'Home',
  list: [
    'List item 1',
    'List item 2',
    'List item 3'
  ],
  matrix: [
    ['Matrix item 1-1', 'Matrix item 1-2', 'Matrix item 1-3'],
    ['Matrix item 2-1', 'Matrix item 2-2', 'Matrix item 2-3'],
    ['Matrix item 3-1', 'Matrix item 3-2', 'Matrix item 3-3']
  ],
  about: {
    heading: 'About page'
  },
  products: {
    heading: 'Products page',
    hacker: {
      heading: 'Hacker!'
    },
    pro: {
      heading: 'Pro!'
    }
  }
}

// set up socket io connection
const wsEvents = server => {
  const io = socketIo(server)

  io.on('connection', socket => {
    console.log('A user connected')
    socket.emit('content', content)
  })
}

export default wsEvents
