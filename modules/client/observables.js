import Rx from 'rx-lite'
import R from 'ramda'
import socket from '../websockets/'
import config from '../../client-config'
import {createQueryStr} from './core'
import {getDomain, getProjectDomain} from './project'

// export const getEnv$ = Rx.Observable.fromEvent(document, 'env:set')
//   .map(e => e.detail)

// getProjectDetailsAndEnvByDomain$$ :: String -> {*}
export const getProjectDetailsAndEnvByDomain$$ = sanitizedDomain => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      const encodedDomainQuery = encodeURIComponent('domain,' + sanitizedDomain)
      fetch('/api/projects?searchBySecondaryIndex=' + encodedDomainQuery)
        .then(data => data.json())
        .then(projectDetails => {
          observer.onNext(projectDetails)
          observer.onCompleted()
        })
        .catch(err => observer.onError(err))
    }

    return () => {
      cancelled = true
      console.log('Disposed')
    }
  })
  .map(projectDetails => {
    if (R.isEmpty(projectDetails)) { return projectDetails }

    const {domain, stagingDomain, previewProdDomain, previewStagingDomain} = projectDetails
    switch (domain) {
      case domain:
        return {projectDetails, env: 'prod'}
      case projectDetails.stagingDomain:
        return {projectDetails, env: 'staging'}
      case projectDetails.previewProdDomain:
        return {projectDetails, env: 'previewProd'}
      case projectDetails.previewStagingDomain:
        return {projectDetails, env: 'previewStaging'}
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
      .then(dbObj => {
        observer.onNext(dbObj)
        observer.onCompleted()
      })
      .catch(err => observer.onError())
  })
}

// updatePageContentFields$ :: {Observer} -> {*}
export const updatePageContentFields$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    if (typeof(io) !== 'undefined') {
      io.on('pageContentFields:updated', pageContent => {
        observer.onNext(pageContent)
      })
    }
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})

// getRouteContent$$ :: {*} -> String -> String -> String -> Observable
export const getRouteContent$$ = (projectDomain, env, locale, route) => {
  return Rx.Observable.create(observer => {
    const queryStr = createQueryStr([{projectDomain}, {env}, {locale}, {route}])
    fetch(config.apiBase + '/api/contents/route?' + queryStr)
      .then(res => res.json())
      .then(routeContent => {
        observer.onNext(routeContent)
        observer.onCompleted()
      })
      .catch(err => observer.onError(err))
  })
}

/* --- OBSERVABLE EXPOSED TO CLIENT ----------------------------------------- */

// app$$ :: String -> Observable
export const app$$ = route => {
  const currentDomain = getDomain()
  const projectDomain = getProjectDomain()
  return getProjectDetailsAndEnvByDomain$$(projectDomain)
    .flatMap(projectDetailsAndEnv => {
      // if project doesn't exist, exit immediately
      if (R.isEmpty(projectDetailsAndEnv)) { return }

      const {projectDetails, env} = projectDetailsAndEnv
      const {domainMap, prodDomain} = projectDetails

      // first add projectDomain and env to localStorage
      if (typeof(window) !== 'undefined') {
        window.localStorage.setItem('projectDomain', prodDomain)
        window.localStorage.setItem('env', env)
      }

      // then get routeContent
      const currentDomain = getDomain()
      const locale = R.head(Object.keys(domainMap)
        .filter(tld => currentDomain.indexOf('.' + tld) !== -1)
        .map(tld => domainMap[tld]))
      const contentEnv = env.replace('preview', '').toLowerCase()

      return getRouteContent$$({projectDomain: prodDomain, env: contentEnv, locale, route})
    })
}
