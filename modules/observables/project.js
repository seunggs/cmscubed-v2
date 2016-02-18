import Rx from 'rx-lite'
import R from 'ramda'
import config from '../../client-config'

export const getProjectDetailsByProjectDomain$$ = projectDomain => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      fetch(config.apiBase + '/api/projects?searchBySecondaryIndex=projectDomain,' + projectDomain)
        .then(res => res.json())
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
}
