import R from 'ramda'
import domain from 'domain-regex'
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

// checkIsDomain :: String -> Boolean
export const checkIsDomain = str => {
  if (R.isEmpty(str) || R.isNil(str)) { return false }
  const trimmedStr = R.trim(str)
  return domain().test(trimmedStr)
}

// TODO: add test
export const createProjectNameIsAvailable$ = projectName => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      fetch(config.apiBase + '/api/projects/' + projectName)
        .then(res => {
          return res.json()
        })
        .then(projectObj => {
          console.log('projectObj: ', projectObj)
          const projectNameIsAvailable = R.isEmpty(projectObj) ? true : false
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
