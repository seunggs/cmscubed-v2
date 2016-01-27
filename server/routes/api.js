import express from 'express'
import fetch from 'node-fetch'
import {convertPathToRoute} from '../../utils/cmscubed/'

const router = express.Router()

// temporary - get it from DB
const content = {
  home: {
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
    ]
  },
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

router.route('/contents')
  .get((req, res) => {
    const route = convertPathToRoute(req.query.path)

    res.send(content)
  })

export default router
