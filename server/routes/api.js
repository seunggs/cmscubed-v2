import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

router.route('/contents')
  .get((req, res) => {
    res.send(content)
  })

export default router
