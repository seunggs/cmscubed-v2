import express from 'express'
import fetch from 'node-fetch'
import rdb from '../config/rdbdash'
import R from 'ramda'

const router = express.Router()

/* --- Users routes --------------------------------------------------------- */

router.route('/users')
  .post((req, res) => {
    const userObj = req.body
    console.log(userObj)
    const userEmail = userObj.email
    rdb.table('users')
      .getAll(userEmail, {index: 'email'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        if (R.isEmpty(dbRes)) {
          return rdb.table('users')
            .insert(userObj)
            .run()
        } else {
          return
        }
      })
      .then(dbRes => {
        console.log('final dbRes: ', dbRes)
        res.send(userObj)
      })
      .catch(err => res.send(err))
  })

router.route('/users/:userEmail')
  .get((req, res) => {
    const userEmail = decodeURIComponent(req.params.userEmail)
    console.log('userEmail: ', userEmail)
    rdb.table('users')
      .getAll(userEmail, {index: 'email'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        if (R.isEmpty(dbRes)) {
          res.send([])
        } else {
          res.send(R.head(dbRes))
        }
      })
      .catch(err => res.send(err))
  })

export default router

/* --- Projects routes --------------------------------------------------------- */

router.route('/projects/:projectName')
  .get((req, res) => {
    const projectName = req.params.projectName
    console.log('projectName: ', projectName)
    rdb.table('projects')
      .getAll(projectName, {index: 'project'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        if (R.isEmpty(dbRes)) {
          console.log('Project name available')
          res.send([])
        } else {
          res.send(R.head(dbRes))
        }
      })
      .catch(err => res.send(err))
  })
