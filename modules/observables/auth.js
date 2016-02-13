import Rx from 'rx-lite'
import config from '../../client-config'
import R from 'ramda'

export const addUserProfile$$ = (lock, idToken) => {
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
      .catch(err => observer.onError(err))
    })

    return () => console.log('Disposed')
  })
}

export const getUserProject$$ = userEmail => {
  const encodedUserEmail = encodeURIComponent(userEmail)
  return Rx.Observable.create(observer => {
    fetch(config.apiBase + '/api/users/' + encodedUserEmail)
      .then(res => res.json())
      .then(userObj => {
        console.log('userObj: ', userObj)
        if (R.isEmpty(userObj)) {
          observer.onNext(null)
          observer.onCompleted()
        } else {
          if (!R.prop('project', R.head(userObj))) {
            observer.onNext(null)
            observer.onCompleted()
          } else {
            observer.onNext(R.head(userObj).project)
            observer.onCompleted()
          }
        }
      })
      .catch(err => observer.onError(err))

    return () => console.log('Disposed')
  })
}
