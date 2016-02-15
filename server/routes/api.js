import express from 'express'
import fetch from 'node-fetch'
import rdb from '../config/rdbdash'
import R from 'ramda'
import Rx from 'rx-lite'
import {getProjectDetailsBySecondaryIndex$$} from '../observables/db'

const router = express.Router()

/* --- Users routes --------------------------------------------------------- */

router.route('/users')

  // Create user in Users table
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

  // Get a specific user from Users table
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

  // Update a specific user in Users table
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

/* --- Projects routes --------------------------------------------------------- */

router.route('/projects')

  // Get projectDetails (by secondary index) from Projects table
  // Query format: ?searchBySecondaryIndex=key,value
  // Exception: key can be 'domain' which searches for all secondary indexes that contain 'domain'
  .get((req, res) => {
    const queryPair = R.split(',', req.query.searchBySecondaryIndex)
    const key = R.head(queryPair)
    const value = R.last(decodeURIComponent(queryPair))

    if (key === 'domain') {
      const getProjectDetailsByDomain$ = getProjectDetailsBySecondaryIndex$$('prodDomain', value)
      const getProjectDetailsByStagingDomain$ = getProjectDetailsBySecondaryIndex$$('stagingDomain', value)
      const getProjectDetailsByPreviewProdDomain$ = getProjectDetailsBySecondaryIndex$$('previewProdDomain', value)
      const getProjectDetailsByPreviewStagingDomain$ = getProjectDetailsBySecondaryIndex$$('previewStagingDomain', value)
      Rx.Observable.zip(
        getProjectDetailsByDomain$,
        getProjectDetailsByStagingDomain$,
        getProjectDetailsByPreviewProdDomain$,
        getProjectDetailsByPreviewStagingDomain$,
        (s1, s2, s3, s4) => [s1, s2, s3, s4]
      )
        .map(projectDetailsArray => {
          console.log(projectDetailsArray)
          return R.compose(R.flatten, R.reject(R.isEmpty))(projectDetailsArray)
        })
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

  // Create projectDetails in Projects table
  .post((req, res) => {
    const projectDetails = req.body
    console.log(projectDetails)
    const {prodDomain} = projectDetails
    rdb.table('projects')
      .getAll(prodDomain, {index: 'prodDomain'})
      .run()
      .then(dbRes => {
        console.log(dbRes)
        if (R.isEmpty(dbRes)) {
          return rdb.table('projects')
            .insert(projectDetails)
            .run()
        } else {
          return {}
        }
      })
      .then(dbRes => {
        console.log('final dbRes: ', dbRes)
        res.send(projectDetails)
      })
      .catch(err => res.send(err))
  })

/* --- Contents routes --------------------------------------------------------- */

// routeContent (array of all pages that falls within a given route - i.e. '/' would get you rootContent)
router.route('/contents/route')

  // Get routeContent from Contents table
  // Query format: ?projectDomain=x&env=x&locale=x&route=encodedX
  .get((req, res) => {
    const decodedQuery = R.mapObjIndexed((val, key) => decodeURIComponent(val))(req.query)
    const {projectDomain, env, locale, route} = decodedQuery
    rdb.table('contents')
      .getAll(projectDomain, {index: 'projectDomain'})
      .filter({env: env})
      .filter({locale: locale})
      .filter(contentEntry => {
        return contentEntry('route').match('^'+route)
      })
      .run()
      .then(dbContentObjs => res.send(dbContentObjs))
      .catch(err => res.send(err))
  })

// pageContent
router.route('/contents/page')

  // Get pageContent from Contents table
  // Query format: ?projectDomain=x&env=x&locale=x&route=encodedX
  .get((req, res) => {
    const decodedQuery = R.mapObjIndexed((val, key) => decodeURIComponent(val))(req.query)
    const {projectDomain, env, locale, route} = decodedQuery
    rdb.table('contents')
      .getAll(projectDomain, {index: 'projectDomain'})
      .filter({env: env})
      .filter({locale: locale})
      .filter({route: route})
      .run()
      .then(dbContentObjs => res.send(dbContentObjs))
      .catch(err => res.send(err))
  })

  // Update pageContent in Contents table
  .put((req, res) => {
    const contentUpdateObj = req.body
    console.log('contentUpdateObj: ', contentUpdateObj)
    const {projectDomain, env, locale, route, content} = contentUpdateObj
    const contentEnv = R.compose(R.toLower, R.replace('Domain', ''), R.replace('preview', ''))(env)
    rdb.table('contents_' + env)
      .getAll(projectDomain, {index: 'projectDomain'})
      .filter({locale: locale})
      .filter({route: route})
      .run()
      .then(dbRes => {
        if (R.equals(0, dbRes.length)) {
          const dbContentObj = R.dissoc('env', contentUpdateObj)
          return rdb.table('contents_' + contentEnv)
            .insert(dbContentObj)
        } else {
          return rdb.table('contents_' + contentEnv)
            .getAll(projectDomain, {index: 'projectDomain'})
            .filter({locale: locale})
            .filter({route: route})
            .update({content: content})
        }
      })
      .then(dbRes => {
        console.log('dbRes: ', dbRes)
        res.send(dbRes)
      })
      .catch(err => res.send(err))
  })

export default router
