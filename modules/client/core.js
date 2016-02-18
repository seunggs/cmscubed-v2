import R from 'ramda'
import Rx from 'rx-lite'
import {updatePageContent$$, getInitContent$$} from './observables'

/* --- PURE ----------------------------------------------------------------- */

const log = x => { console.log(x); return x }

// TODO: add test
export const getCurrentDomain = (locationObj) => {
  return locationObj.host + (locationObj.port ? ':' + locationObj.port : '')
}

// TODO: add test
// isLocalEnv :: () -> Boolean
export const isLocalEnv = (locationObj) => {
  const currentDomain = getCurrentDomain(locationObj)
  return currentDomain.indexOf(':') !== -1
}

// sanitizeRoute :: String -> String
export const sanitizeRoute = R.curry(route => {
  if (R.last(route) === '/') {
    return R.equals('/', route) ? '/' : R.init(route)
  }
  return route
})

// getContentEnv :: String -> String
export const getContentEnv = R.compose(R.toLower, R.replace('Domain', ''), R.replace('preview', ''))

// createEncodedQueryStr :: [{*}] -> String
export const createEncodedQueryStr = R.curry(queryObjsArray => {
  return R.tail(queryObjsArray.reduce((prev, curr) => {
    const key = R.head(Object.keys(curr))
    return prev + '&' + key + '=' + encodeURIComponent(curr[key])
  }, ''))
})

// deepCopyValues :: {*} -> {*} -> {*}
export const deepCopyValues = R.curry((fromObj, toObj) => {
  const convertToArray = obj => R.keys(obj).reduce((prev, curr) => prev.concat(R.prop(curr, obj)), [])
  const toObjKeys = R.keys(toObj)
  const deepCopy = toObjKeys.reduce((prev, curr) => {
    const valueInFromObj = R.prop(curr, fromObj)
    if (!R.isNil(valueInFromObj)) { // if this key exists in fromObj
      if (R.keys(valueInFromObj).length > 0) { // if value of this key is an innumerable
        const valueInToObj = R.prop(curr, prev)
        if (R.isArrayLike(valueInFromObj)) { // if value of this key is an array, turn it back into array before returning
          return R.assoc(curr, convertToArray(deepCopyValues(valueInFromObj, valueInToObj)), prev)
        } else { // if value of this key is an object
          return R.assoc(curr, deepCopyValues(valueInFromObj, valueInToObj), prev)
        }
      } else { // if value of this key is a primitive
        return R.assoc(curr, R.prop(curr, fromObj), prev)
      }
    } else { // if this key doesn't exist in fromObj
      return prev
    }
  }, toObj)
  return deepCopy
})

// getUpdatedPageContentFromSchemaChange :: {*} -> {*} -> {*}
export const getUpdatedPageContentFromSchemaChange = R.curry((currentPageContent, newSchemaObj) => {
  if (R.isNil(currentPageContent)) {
    return newSchemaObj
  } else {
    // only run deepCopyValues if schemaObj has changed
    if (JSON.stringify(currentPageContent) !== JSON.stringify(newSchemaObj)) {
      return deepCopyValues(currentPageContent, newSchemaObj)
    } else {
      return null
    }
  }
})

// createContentUpdateObj :: String -> String -> String -> {*} -> [*]
export const createContentUpdateObj = R.curry((projectDomain, env, locale, route, updatedPageContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  return {projectDomain, env, locale, route: sanitizedRoute, content: updatedPageContent}
})

// getContentFromSchemaObj :: {*} -> String -> {*}
export const getContentFromSchemaObj = (localStorageObj, route) => {
  return JSON.parse(localStorageObj.getItem(route))
}

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  if (R.isNil(rootContent)) { return undefined } // exit immediately if rootContent is undefined

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

/* --- IMPURE --------------------------------------------------------------- */

// updatePageContentOnSchemaChange :: {*} -> String -> String -> {*} -> {*} -> IMPURE (send POST request)
export const updatePageContentOnSchemaChange = (localStorageObj, currentDomain, route, rootContent, schemaObj) => {
  if (R.isNil(rootContent)) { return false } // exit immediately if rootContent is undefined

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = getContent(sanitizedRoute, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)

  // Only send if content has changed
  if (!R.isNil(updatedPageContent)) {
    const projectDomain = currentDomain
    const env = localStorageObj.getItem('env')
    const locale = localStorageObj.getItem('locale')
    const contentUpdateObj = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)

    updatePageContent$$(contentUpdateObj).subscribe(
      () => console.log('Updated pageContent from schema change POST request sent!'),
      err => console.log('Updating pageContent from schema change failed: ', err)
    )
    return true
  }
  return false
}

/* --- EXPOSED TO USER (IMPURE) --------------------------------------------- */

// NO TEST
// getRootContent :: String -> String -> [*] -> Observable (-> routeContent) + IMPURE (set localStorage)
export const getRootContent = R.curry((projectDomain, route, excludedRoutes) => {
  if (isLocalEnv(window.location)) { console.log('In local environment...') }

  // If PREVIEW, send a socket event
  // Otherwise, POST - but first call will always be POST since isPreview is unknown until after the first call
  if (window.localStorage.getItem('isPreview')) {
    // send socket.io event
    console.log('In preview...')
    // MUST RETURN AN Observable but which Observable? - Put preview condition inside the below else
    // Return one Observable composed of two Observables - one fetch and one socket
  } else {
    const currentDomain = getCurrentDomain(window.location)
    return getInitContent$$(projectDomain, currentDomain, route, excludedRoutes)
      .map(initContentObj => {
        const {projectDetails, env, isPreview, routeContent} = initContentObj

        // First set localStorage items
        window.localStorage.setItem('projectDetails', JSON.stringify(projectDetails))
        window.localStorage.setItem('env', env) // prod or staging
        window.localStorage.setItem('isPreview', isPreview)

        // Then return routeContent to the client
        return routeContent
      })
  }
})

// NO TEST
// setContentSchema :: String -> {*} -> {*} -> IMPURE
export const setContentSchema = (route, rootContent, schemaObj) => {
  // Is this a local environment? Then save the schemaObj in localStorage for getContent() to use
  if (isLocalEnv(window.location)) {
    window.localStorage.setItem('localenv-' + route, JSON.stringify(schemaObj))
  }

  const currentDomain = getCurrentDomain(window.location)
  updatePageContentOnSchemaChange(window.localStorage, currentDomain, route, rootContent, schemaObj)
}

// NO TEST
// getContent :: String -> {*} -> {*}
export const getContent = R.curry((route, rootContent) => {
  // Is this a local environment? Then combine rootContent with schema to get the new content
  // TODO: use getUpdatedPageContentFromSchemaChange
  if (typeof(window) !== 'undefined') {
    if (isLocalEnv(window.location)) { return getContentFromSchemaObj(window.localStorage, 'localenv-' + route) }
  }

  return getPageContent(route, rootContent)
})
