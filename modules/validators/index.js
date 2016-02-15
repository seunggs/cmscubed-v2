import R from 'ramda'
import parseDomain from 'parse-domain'
import {convertToCamelCase} from '../utils/'
import config from '../../client-config'

// checkIsNotEmpty :: String -> Boolean
export const checkIsNotEmpty = input => {
  return !R.isEmpty(input) && !R.isNil(input)
}

// checkIsCamelCased :: String -> Boolean
export const checkIsCamelCased = text => {
  if (R.isEmpty(text) || R.isNil(text)) { return false }
  const trimmedText = R.trim(text)
  const camelCasedText = convertToCamelCase(trimmedText)
  return trimmedText === camelCasedText ? true : false
}

// TODO: add test
// checkIsDomain :: String -> Boolean
export const checkIsDomain = str => {
  if (R.isEmpty(str) || R.isNil(str)) { return false }
  const trimmedStr = R.trim(str)
  return !R.isNil(parseDomain(trimmedStr))
}

// TODO: add test
export const projectDomainIsAvailable$$ = domain => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      fetch(config.apiBase + '/api/projects?searchBySecondaryIndex=domain,' + encodeURIComponent(domain))
        .then(res => {
          return res.json()
        })
        .then(projectDetails => {
          console.log('projectDetails: ', projectDetails)
          const projectNameIsAvailable = R.isEmpty(projectDetails) ? true : false
          observer.onNext(projectNameIsAvailable)
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
