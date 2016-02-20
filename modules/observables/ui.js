import Rx from 'rx-lite'
import R from 'ramda'
import config from '../../client-config'
import {createPreviewDomain, sanitizeDomain} from '../core/content'

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
    const {prodDomain, stagingDomain, localDomain, locale, email, project} = formValues
    console.log('prodDomain: ', prodDomain)
    const sanitizedProdDomain = sanitizeDomain(prodDomain)
    console.log('sanitizedProdDomain: ', sanitizedProdDomain)
    const sanitizedStagingDomain = sanitizeDomain(stagingDomain)
    const previewProdDomain = createPreviewDomain(sanitizedProdDomain, 'prod', locale)
    const previewStagingDomain = createPreviewDomain(sanitizedProdDomain, 'staging', locale)

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
        previewProdDomains: [previewProdDomain],
        previewStagingDomains: [previewStagingDomain],
        users: {
          superadmin: [email]
        },
        defaultLocale: locale,
        localeMap: {
          [locale]: {
            prodDomain: sanitizedProdDomain,
            stagingDomain: sanitizedStagingDomain,
            previewProdDomain: previewProdDomain,
            previewStagingDomain: previewStagingDomain
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
      console.log('Inside addProjectToUser$')
      const encodedEmail = encodeURIComponent(formValues.email)
      const sanitizedProdDomain = sanitizeDomain(formValues.prodDomain)
      const userUpdateObj = {projectDomain: sanitizedProdDomain}
      console.log('userUpdateObj: ', userUpdateObj)

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
