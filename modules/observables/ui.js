import Rx from 'rx-lite'
import R from 'ramda'
import config from '../../client-config'

export const onBlur$$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'blur')
}

export const sendContentFieldFromEditor$$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'keyup')
    .map(e => e.target.innerHTML)
    .debounce(200)
}

export const addNewProject$$ = formValues => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      console.log('Inside createNewProject$')
      const dbProjectObj = {
        project: formValues.project,
        domain: formValues.domain,
        stagingDomain: formValues.stagingDomain,
        users: [formValues.email],
        defaultLocale: formValues.locale,
        locales: [formValues.locale],
        domainMap: {
          [formValues.locale]: formValues.domain
        }
      }

      fetch(config.apiBase + '/api/projects', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dbProjectObj)
      })
        .then(res => res.json())
        .then(dbObj => {
          observer.onNext(dbObj)
          observer.onCompleted()
        })
        .catch(err => observer.onError())
    }

    return () => {
      cancelled = true
      console.log('Disposed')
    }
  })
}

export const addProjectToUser$$ = (formValues) => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      console.log('Inside createAddProjectToUser$')
      const encodedEmail = encodeURIComponent(formValues.email)
      const userUpdateObj = {project: formValues.project}

      fetch(config.apiBase + '/api/users/' + encodedEmail, {
        method: 'put',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userUpdateObj)
      })
        .then(res => res.json())
        .then(dbObj => {
          console.log('dbObj inside createAddProjectToUser', dbObj)
          observer.onNext(dbObj)
          observer.onCompleted()
        })
        .catch(err => observer.onError())
    }

    return () => {
      cancelled = true
      console.log('Disposed')
    }
  })
}

export const addNewProjectAndAddProjectToUser$$ = formValues => {
  return Rx.Observable.zip(addNewProject$$(formValues), addProjectToUser$$(formValues))
}
