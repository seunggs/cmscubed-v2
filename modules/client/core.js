import R from 'ramda'
import Rx from 'rx-lite'
import {updatePageContent$$} from './observables'
import {getDomain, getProject, getEnv} from './project'

/* --- PURE ----------------------------------------------------------------- */

const log = x => { console.log(x); return x }

// sanitizeRoute :: String -> String
export const sanitizeRoute = R.curry(route => {
  if (R.last(route) === '/') {
    return R.equals('/', route) ? '/' : R.init(route)
  }
  return route
})

// sanitizeDomain :: String -> String
// Strip the domain of protocol (i.e. 'http://')
export const sanitizeDomain = R.compose(R.replace('http://', ''), R.replace('https://', ''))

// createQueryStr :: [{*}] -> String
export const createQueryStr = R.curry(queryObjsArray => {
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

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

/* --- IMPURE --------------------------------------------------------------- */

// setPageContentSchema :: String -> {*} -> {*} -> IMPURE (send event) + Boolean
export const setPageContentSchema = (route, rootContent, schemaObj) => {
  // Exit immediately if rootContent is undefined
  if (R.isNil(rootContent)) { return false }

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = getPageContent(sanitizedRoute, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)

  // Only send if content has changed
  if (!R.isNil(updatedPageContent)) {
    if (typeof(window) !== 'undefined') {
      const projectDomain = window.localStorage.getItem('projectDomain')
      const env = window.localStorage.getItem('env')
      const contentUpdateObj = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)
      updatePageContent(contentUpdateObj)
    }
    return true
  }
  return false
}

// updatePageContent :: {*} -> IMPURE (send POST request)
export const updatePageContent = contentUpdateObj => {
  updatePageContent$$(contentUpdateObj).subscribe(
    () => console.log('Updated pageContent from schema change POST request sent!'),
    err => console.log('Updating pageContent from schema change failed: ', err)
  )
}
