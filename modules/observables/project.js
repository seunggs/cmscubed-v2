import Rx from 'rx-lite'
import socket from '../websockets/'
import R from 'ramda'

export const getProjectNameAndEnvByDomain$$ = domain => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      const encodedDomainQuery = encodeURIComponent('domain,' + domain)
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
    if (R.equals(domain, projectDetails.domain)) {
      const env = 'production'
    } else if (R.equals(domain, projectDetails.stagingDomain)) {
      const env = 'staging'
    } else if (R.equals(domain, projectDetails.previewDomain)) {
      const env = 'preview'
    } else {
      const env = null
    }
    return {projectName: projectDetails.project, env: env}
  })
}
