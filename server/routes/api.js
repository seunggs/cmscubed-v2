import express from 'express'
import fetch from 'node-fetch'
import rdb from '../config/rdbdash'
import R from 'ramda'
import Rx from 'rx-lite'
import {
  createUserInDB$$,
  getUserFromDB$$,
  updateUserInDB$$,
  getProjectDetailsByDomainFromDB$$,
  getProjectDetailsBySecondaryIndexFromDB$$,
  createProjectInDB$$,
  getRouteContentFromDB$$,
  getPageContentFromDB$$,
  updatePageContentInDB$$
} from '../observables/db'
import {convertEnvToShortEnv, isLocalEnv} from '../../modules/client/core'
import {sanitizeDomain, sanitizeLocalDomain} from '../../modules/core/content'

const router = express.Router()

/* --- Users routes --------------------------------------------------------- */

router.route('/users')

  // Create user in Users table
  .post((req, res) => {
    const userObj = req.body
    console.log(userObj)
    createUserInDB$$(userObj).subscribe(
      originalUserObj => res.send(originalUserObj),
      err => res.send(err)
    )
  })

router.route('/users/:userEmail')

  // Get a specific user from Users table
  .get((req, res) => {
    const userEmail = decodeURIComponent(req.params.userEmail)
    getUserFromDB$$(userEmail).subscribe(
      userObjs => {
        console.log(userObjs)
        if (R.isEmpty(userObjs)) {
          res.send({})
        } else {
          res.send(R.head(userObjs))
        }
      },
      err => res.send(err)
    )
  })

  // Update a specific user in Users table
  .put((req, res) => {
    const userEmail = decodeURIComponent(req.params.userEmail)
    const userUpdateObj = req.body
    updateUserInDB$$(userEmail, userUpdateObj).subscribe(
      originalUserUpdateObj => res.send(originalUserUpdateObj),
      err => res.send(err)
    )
  })

/* --- Projects routes ------------------------------------------------------ */

router.route('/projects')

  // Get projectDetails (by secondary index) from Projects table
  // Query format: ?searchBySecondaryIndex=key,value
  // Exception: key can be 'domain' which searches for all secondary indexes that contain 'domain'
  .get((req, res) => {
    const queryPair = R.split(',', req.query.searchBySecondaryIndex)
    console.log(queryPair)
    const key = R.head(queryPair)
    const value = decodeURIComponent(R.last(queryPair))
    console.log('value: ', value)

    if (key === 'domain') {
      getProjectDetailsByDomainFromDB$$(value)
        .subscribe(
          projectDetails => {
            if (R.isEmpty(projectDetails)) {
              res.send([])
            } else {
              res.send(R.head(projectDetails))
            }
          },
          err => { res.send(err) }
        )
    } else {
      getProjectDetailsBySecondaryIndexFromDB$$(key, value)
        .subscribe(
          projectDetails => {
            if (R.isEmpty(projectDetails)) {
              res.send([])
            } else {
              res.send(R.head(projectDetails))
            }
          },
          err => { res.send(err) }
        )
    }
  })

  // Create projectDetails in Projects table
  .post((req, res) => {
    const projectDetails = req.body
    console.log(projectDetails)
    createProjectInDB$$(projectDetails).subscribe(
      originalProjectDetails => res.send(originalProjectDetails),
      err => res.send(err)
    )
  })

/* --- Contents routes ------------------------------------------------------ */

// routeContent (array of all pages that falls within a given route - i.e. '/' would get you rootContent)
router.route('/contents/route')

  // Get routeContent from Contents table
  // Query format: ?projectDomain=x&env=x&locale=x&route=encodedX
  .get((req, res) => {
    const decodedQuery = R.mapObjIndexed((val, key) => decodeURIComponent(val))(req.query)
    const {projectDomain, env, locale, route} = decodedQuery
    getRouteContentFromDB$$(projectDomain, env, locale, route).subscribe(
      routeContent => {
        // if content is empty, send an empty object
        if (R.isEmpty(routeContent)) {
          res.send({})
        } else {
          res.send(routeContent)
        }
      },
      err => res.send(err)
    )
  })

// pageContent
router.route('/contents/page')

  // Get pageContent from Contents table
  // Query format: ?projectDomain=x&env=x&locale=x&route=encodedX
  .get((req, res) => {
    const decodedQuery = R.mapObjIndexed((val, key) => decodeURIComponent(val))(req.query)
    const {projectDomain, env, locale, route} = decodedQuery
    getPageContentFromDB$$(projectDomain, env, locale, route).subscribe(
      pageContent => {
        // if content is empty, send an empty object
        if (R.isEmpty(pageContent)) {
          res.send({})
        } else {
          res.send(pageContent)
        }
      },
      err => res.send(err)
    )
  })

  // Update pageContent in Contents table
  .put((req, res) => {
    const contentUpdateObj = req.body
    console.log('contentUpdateObj: ', contentUpdateObj)
    const {projectDomain, env, locale, route, content} = contentUpdateObj
    updatePageContentInDB$$(projectDomain, env, locale, route, content).subscribe(
      dbRes => res.send(dbRes),
      err => res.send(err)
    )
  })

/* --- Client routes -------------------------------------------------------- */

// Initial content request from the client on app load
router.route('/client/contents/init')

  // Get project details first and then contents; returns {projectDetails, env, routeContent}
  // Query format: ?projectDomain=x&domain=x&route=encodedX&excludedRoutes=encodedX,encodedY
  .get((req, res) => {
    const decodedQuery = R.mapObjIndexed((val, key) => decodeURIComponent(val))(req.query)
    console.log('decodedQuery: ', decodedQuery)
    const {projectDomain, domain, route, excludedRoutes} = decodedQuery
    const excludedRoutesArray = R.isEmpty(excludedRoutes) ? [] : excludedRoutes.split(',')
    const sanitizedProjectDomain = sanitizeDomain(projectDomain)
    let projectDetailsArrayToReturn, envToReturn, localeToReturn, isPreview

    getProjectDetailsBySecondaryIndexFromDB$$('projectDomain', sanitizedProjectDomain)
      .flatMap(projectDetailsArray => {
        if (R.isEmpty(projectDetailsArray)) { return [] }

        const projectDetails = R.head(projectDetailsArray)
        const {projectDomain, localDomain, localMappedTo, defaultLocale, localeMap, contentPlaceholder, prodDomains, stagingDomains, previewProdDomains, previewStagingDomains} = projectDetails
        const {locale: localeInLocal, domain: domainInLocal} = localMappedTo

        // TODO: separate out the logic and add tests -> /utils/api-helpers.js
        // First see if env is local; if it is, map it to designated env (defaults to staging)
        console.log('isLocalEnv? ', isLocalEnv(domain))
        const sanitizedDomain = isLocalEnv(domain) ? R.path([localeInLocal, domainInLocal], localeMap) : sanitizeDomain(domain)
        const allDomainGroups = [{prodDomains}, {stagingDomains}, {previewProdDomains}, {previewStagingDomains}]
        const envDomain = R.init(
          allDomainGroups
            .filter(domainGroupObj => R.compose(R.contains(sanitizedDomain), R.head, R.values)(domainGroupObj))
            .map(domainGroupObj => R.compose(R.head, R.keys)(domainGroupObj))
            .reduce(R.add, '') // prodDomains, stagingDomains, previewProdDomains, previewStagingDomains
        ) // prodDomain, stagingDomain, previewProdDomain, previewStagingDomain
        const contentEnv = convertEnvToShortEnv(envDomain) // prod, staging
        const locale = R.compose(R.head, R.reject(R.isEmpty), R.values, R.mapObjIndexed((domains, locale) => domains[envDomain] === sanitizedDomain ? locale : ''))(localeMap)
        console.log('envDomain: ', envDomain)
        console.log('contentEnv: ', contentEnv)
        console.log('locale: ', locale)

        // Set projectDetails, env, isPreview to return to client
        projectDetailsArrayToReturn = R.clone(projectDetailsArray)
        envToReturn = R.clone(contentEnv)
        localeToReturn = R.clone(locale)
        isPreview = envDomain.indexOf('preview') !== -1 ? true : false

        console.log(projectDetailsArrayToReturn, envToReturn, localeToReturn, isPreview)

        if (R.isEmpty(excludedRoutesArray)) {
          return getRouteContentFromDB$$(projectDomain, contentEnv, locale, route)
        } else {
          return getSelectRouteContentFromDB$$(projectDomain, contentEnv, locale, route, excludedRoutesArray)
        }
      })
      // .map(routeContent => {
      //   if (R.isEmpty(projectDetailsArrayToReturn)) { return [] }
      //   if (R.isEmpty(excludedRoutes)) { return routeContent }
      //
      //   // exclude all specified routes and their children
      //   const selectRouteContent = excludedRoutesArray.reduce((filteredRouteContent, routeToRemove) => {
      //     const filtered = R.reject(singleRouteContent => {
      //       const singleRouteContentKey = R.compose(R.head, R.keys)(singleRouteContent)
      //       return R.test(new RegExp('^'+routeToRemove), singleRouteContentKey)
      //     })(filteredRouteContent)
      //     return filtered
      //   }, routeContent)
      //
      //   return selectRouteContent
      // })
      .subscribe(
        routeContent => {
          // if project doesn't exist, return {}
          if (R.isEmpty(projectDetailsArrayToReturn)) {
            res.send({})
          } else {
            const contentInitObj = ({
              projectDetails: R.head(projectDetailsArrayToReturn),
              env: envToReturn,
              locale: localeToReturn,
              isPreview,
              routeContent
            })
            console.log('contentInitObj: ', contentInitObj)
            // TODO: remove this after testing
            setTimeout(() => {
              console.log('Waiting a little...')
              res.send(contentInitObj)
            }, 3000)
          }
        },
        err => res.send(err)
      )
})

export default router
