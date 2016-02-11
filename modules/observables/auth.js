import Rx from 'rx-lite'
import config from '../../client-config'
import R from 'ramda'

export const createAddUserProfile$ = (lock, idToken) => {
  return Rx.Observable.create(observer => {
    lock.getProfile(idToken, (err, profile) => {
      if (err) {
        observer.onError(err)
      }

      fetch(config.apiBase + '/api/users', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })
      .then(res => res.json())
      .then(userObj => {
        observer.onNext(userObj)
        observer.onCompleted()
      })
      .catch(err => observer.onError())
    })

    return () => console.log('Disposed')
  })
}

export const createSetupComplete$ = userEmail => {
  const encodedUserEmail = encodeURIComponent(userEmail)
  return Rx.Observable.create(observer => {
    fetch(config.apiBase + '/api/users/' + encodedUserEmail)
      .then(res => res.json())
      .then(userObj => {
        if (!userObj) {
          observer.onNext(false)
          observer.onCompleted()
        } else {
          if (!R.prop('project', userObj)) {
            observer.onNext(false)
            observer.onCompleted()
          } else {
            observer.onNext(true)
            observer.onCompleted()
          }
        }
      })
      .catch(err => observer.onError(err))

    return () => console.log('Disposed')
  })
}
