import Rx from 'rx-lite'
import R from 'ramda'
import config from '../../client-config'
import {createPreviewDomain, sanitizeDomain} from 'core/content'

export const onBlur$$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'blur')
}

// TODO: only update on key press not arrow keys
export const sendContentField$$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'keyup')
    .map(e => e.target.innerHTML)
    .distinctUntilChanged()
    // .debounce(200)
}

export const checkPreviewIsReady$$ = projectUrl => {
  return Rx.Observable.fromEvent(global, 'message')
    .map(e => {
      if (e.origin !== 'http://' + projectUrl && e.origin !== 'http://127.0.0.1:4000') { return null }
      if (e.data !== 'previewPage:ready') { return null }
      console.log('previewPage:ready event received!')
      return e
    })
}

export const checkSocketIoLoadedInPreview$$ = projectUrl => {
  return Rx.Observable.fromEvent(global, 'message')
    .map(e => {
      if (e.origin !== 'http://' + projectUrl && e.origin !== 'http://127.0.0.1:4000') { return null }
      if (e.data !== 'socketio:loaded') { return null }
      console.log('socketio:loaded event received!')
      return e
    })
}

export const addNewProject$$ = formValues => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    const {prodDomain, stagingDomain, localDomain, locale, email, project} = formValues
    const sanitizedProdDomain = sanitizeDomain(prodDomain)
    const sanitizedStagingDomain = sanitizeDomain(stagingDomain)

    if (!cancelled) {
      console.log('Inside createNewProject$')
      const dbProjectObj = {
        project: project,
        projectDomain: sanitizedProdDomain,
        localMappedTo: { // which env content to show if user is on local env
          locale: locale,
          domain: 'stagingDomain'
        },
        prodDomains: [sanitizedProdDomain],
        stagingDomains: [sanitizedStagingDomain],
        users: {
          superadmin: [email]
        },
        defaultLocale: locale,
        localeMap: {
          [locale]: {
            prodDomain: sanitizedProdDomain,
            stagingDomain: sanitizedStagingDomain
          }
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
      const encodedEmail = encodeURIComponent(formValues.email)
      const sanitizedProdDomain = sanitizeDomain(formValues.prodDomain)
      const userUpdateObj = {projectDomain: sanitizedProdDomain}

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
