import Rx from 'rx-lite'
import R from 'ramda'
import socket from '../websockets/'
import config from '../../client-config'
import {createEncodedQueryStr, getContentEnv} from './core'

// export const getEnv$ = Rx.Observable.fromEvent(document, 'env:set')
//   .map(e => e.detail)

// getInitContent$$ :: String -> String -> [*] -> Observable ({*})
// Returns contentInitObj = {projectDetails, env, isPreview, routeContent}
export const getInitContent$$ = (projectDomain, domain, route, excludedRoutes) => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      // ?projectDomain=x&domain=x&route=encodedX&excludedRoutes=encodedX,encodedY
      const encodedQueryStr = createEncodedQueryStr([{projectDomain}, {domain}, {route}, {excludedRoutes}])
      fetch(config.apiBase + '/api/client/contents/init?' + encodedQueryStr)
        .then(data => data.json())
        .then(contentInitObj => {
          observer.onNext(contentInitObj)
          observer.onCompleted()
        })
        .catch(err => observer.onError(err))
    }

    return () => {
      cancelled = true
      console.log('getInitContent$$ disposed')
    }
  })
}

// // getProjectDetailsAndEnvByDomain$$ :: String -> {*}
// export const getProjectDetailsAndEnvByDomain$$ = sanitizedDomain => {
//   return Rx.Observable.create(observer => {
//     let cancelled = false
//
//     if (!cancelled) {
//       const encodedDomainQuery = encodeURIComponent('domain,' + sanitizedDomain)
//       fetch(config.apiBase + '/api/projects?searchBySecondaryIndex=' + encodedDomainQuery)
//         .then(data => data.json())
//         .then(projectDetailsArray => {
//           observer.onNext(projectDetailsArray)
//           observer.onCompleted()
//         })
//         .catch(err => observer.onError(err))
//     }
//
//     return () => {
//       cancelled = true
//       console.log('Disposed')
//     }
//   })
//   .map(projectDetailsArray => {
//     if (R.isEmpty(projectDetailsArray)) { return null }
//
//     const projectDetails = R.head(projectDetailsArray)
//     const {domain, stagingDomain, previewProdDomain, previewStagingDomain} = projectDetails
//     switch (domain) {
//       case domain:
//         return {projectDetails, env: 'prod'}
//       case stagingDomain:
//         return {projectDetails, env: 'staging'}
//       case previewProdDomain:
//         return {projectDetails, env: 'previewProd'}
//       case previewStagingDomain:
//         return {projectDetails, env: 'previewStaging'}
//     }
//   })
// }

// updatePageContent$$ :: {*} -> {*}
export const updatePageContent$$ = contentUpdateObj => {
  return Rx.Observable.create(observer => {
    fetch(config.apiBase + '/api/contents/page', {
      method: 'put',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contentUpdateObj)
    })
      .then(res => res.json())
      .then(dbRes => {
        observer.onNext(dbRes)
        observer.onCompleted()
      })
      .catch(err => observer.onError())
  })
}

// getRouteContent$$ :: {*} -> String -> String -> String -> Observable
export const getRouteContent$$ = (projectDomain, env, locale, route) => {
  return Rx.Observable.create(observer => {
    const queryStr = createEncodedQueryStr([{projectDomain}, {env}, {locale}, {route}])
    fetch(config.apiBase + '/api/contents/route?' + queryStr)
      .then(res => res.json())
      .then(routeContent => {
        observer.onNext(routeContent)
        observer.onCompleted()
      })
      .catch(err => observer.onError(err))
  })
}

export const rootContentReady$ = Rx.Observable.create(obserer => {

})

/* --- OBSERVABLE EXPOSED TO CLIENT ----------------------------------------- */

// // app$$ :: String -> Observable
// export const app$$ = route => {
//   const currentDomain = getDomain()
//   const projectDomain = getProjectDomain(currentDomain)
//   return getProjectDetailsAndEnvByDomain$$(projectDomain)
//     .flatMap(projectDetailsAndEnv => {
//       // if project doesn't exist, exit immediately
//       if (R.isNil(projectDetailsAndEnv)) { return }
//
//       const {projectDetails, env} = projectDetailsAndEnv
//       const {domainMap, prodDomain} = projectDetails
//
//       // first add projectDomain and env to localStorage
//       if (typeof(window) !== 'undefined') {
//         window.localStorage.setItem('projectDomain', prodDomain)
//         window.localStorage.setItem('env', env)
//       }
//
//       // then get routeContent
//       const currentDomain = getDomain()
//       const locale = R.head(Object.keys(domainMap)
//         .filter(tld => currentDomain.indexOf('.' + tld) !== -1)
//         .map(tld => domainMap[tld]))
//       const contentEnv = getContentEnv(env)
//
//       return getRouteContent$$({projectDomain: prodDomain, env: contentEnv, locale, route})
//     })
// }
