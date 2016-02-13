import express from 'express'
import fetch from 'node-fetch'
import rdb from '../config/rdbdash'
import R from 'ramda'
import {convertPathQueryToRoute} from '../../modules/core/content'
import {getRouteContentFromDB} from '../utils/db'
import {getProjectDetailsBySecondaryIndex$$} from '../observables/db'

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
          return {}
        }
      })
      .then(dbRes => {
        console.log('final dbRes: ', dbRes)
        res.send(userObj)
      })
      .catch(err => res.send(err))
  })

router.route('/users/:userEmail')
  .put((req, res) => {
    const userUpdateObj = req.body
    const userEmail = decodeURIComponent(req.params.userEmail)
    console.log('userEmail: ', userEmail)
    rdb.table('users')
      .getAll(userEmail, {index: 'email'})
      .update(userUpdateObj)
      .run()
      .then(dbRes => {
        console.log('dbRes: ', dbRes)
        res.send(userUpdateObj)
      })
      .catch(err => res.send(err))
  })

router.route('/users/:userEmail')
  .get((req, res) => {
    const userEmail = decodeURIComponent(req.params.userEmail)
    rdb.table('users')
      .getAll(userEmail, {index: 'email'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        res.send(dbRes)
      })
      .catch(err => res.send(err))
  })

export default router

/* --- Projects routes --------------------------------------------------------- */

router.route('/projects')

  // query format: ?searchBySecondaryIndex=key,value
  .get((req, res) => {
    const decodedQueryPair = R.split(',', decodeURIComponent(req.query.searchBySecondaryIndex))
    const key = R.head(decodedQueryPair)
    const value = R.last(decodedQueryPair)

    if (key === 'domain') {
      const getProjectDetailsByDomain$ = getProjectDetailsBySecondaryIndex$$('domain', value)
      const getProjectDetailsByStagingDomain$ = getProjectDetailsBySecondaryIndex$$('stagingDomain', value)
      const getProjectDetailsByPreviewDomain$ = getProjectDetailsBySecondaryIndex$$('previewDomain', value)
      Rx.Observable.zip(getProjectDetailsByDomain$, getProjectDetailsByStagingDomain$, (s1, s2, s3) => [s1, s2, s3])
        .map(projectDetailsArray => R.compose(R.flatten, R.reject(R.isEmpty))(projectDetailsArray))
        .subscribe(
          projectDetails => { res.send(projectDetails) },
          err => { res.send(err) }
        )
    } else {
      getProjectDetailsBySecondaryIndex$$(key, value)
        .subscribe(
          projectDetails => { res.send(projectDetails) },
          err => { res.send(err) }
        )
    }
  })

  .post((req, res) => {
    const projectsObj = req.body
    console.log(projectsObj)
    const project = projectsObj.project
    rdb.table('projects')
      .getAll(project, {index: 'project'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        if (R.isEmpty(dbRes)) {
          return rdb.table('projects')
            .insert(projectsObj)
            .run()
        } else {
          return {}
        }
      })
      .then(dbRes => {
        console.log('final dbRes: ', dbRes)
        res.send(projectsObj)
      })
      .catch(err => res.send(err))
  })

router.route('/projects/:projectName')
  .get((req, res) => {
    const projectName = req.params.projectName
    console.log('projectName: ', projectName)
    rdb.table('projects')
      .getAll(projectName, {index: 'project'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        res.send(dbRes)
      })
      .catch(err => res.send(err))
  })

/* --- Contents routes --------------------------------------------------------- */

router.route('/contents/:projectName')
  .get((req, res) => {
    const projectName = req.params.projectName
    const decodedPathQuery = decodeURIComponent(req.query.path)
    console.log('decodedPathQuery: ', decodedPathQuery)
    const route = convertPathQueryToRoute(decodedPathQuery)
    console.log('projectName: ', projectName)
    console.log('route: ', route)
    getRouteContentFromDB
      .then(routeContentObjs => {
        console.log(routeContentObjs)
        res.send(routeContentObjs)
      })
      .catch(err => res.send(err))
  })
