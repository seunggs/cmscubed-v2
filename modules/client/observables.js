import Rx from 'rx-lite'
import R from 'ramda'
import config from './config'

import {createEncodedQueryStr, convertEnvToShortEnv} from './core'

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
          console.log('contentInitObj: ', contentInitObj)
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

export const getUpdatedContentWS$$ = socket => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      // TODO: add contentField:update event listener as well and return routeContent from it
      socket.on('routeContent:fromDB', routeContent => {
        observer.onNext(routeContent)
      })
    }

    return () => {
      cancelled = true
      console.log('getInitContent$$ disposed')
    }
  })
}

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

// // getRouteContent$$ :: {*} -> String -> String -> String -> Observable
// export const getRouteContent$$ = (projectDomain, env, locale, route) => {
//   return Rx.Observable.create(observer => {
//     const queryStr = createEncodedQueryStr([{projectDomain}, {env}, {locale}, {route}])
//     fetch(config.apiBase + '/api/contents/route?' + queryStr)
//       .then(res => res.json())
//       .then(routeContent => {
//         observer.onNext(routeContent)
//         observer.onCompleted()
//       })
//       .catch(err => observer.onError(err))
//   })
// }
