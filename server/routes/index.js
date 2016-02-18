import express from 'express'
import cors from 'cors'
import api from './api'
import path from 'path'

const router = express.Router()

// cors setting
// const whitelist = ['http://127.0.0.1:3333', 'http://127.0.0.1:4000', 'http://cmscubed-test.surge.sh'];
// const corsOptions = {
//   origin(origin, callback) {
//     const originIsWhitelisted = whitelist.indexOf(origin) !== -1;
//     callback(null, originIsWhitelisted);
//   }
// };
const corsOptions = {origin: /[\s\S]/}
router.use(cors(corsOptions))
router.options('*', cors(corsOptions))

// routes
router.use('/api', api)

// default to client routing for all others
router.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../index.html'))
})

export default router
