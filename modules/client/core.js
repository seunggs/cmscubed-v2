import R from 'ramda'
import Rx from 'rx-lite'
import {updatePageContent$$, getInitContent$$, getUpdatedContentWS$$} from './observables'

/* --- PURE ----------------------------------------------------------------- */

const log = x => { console.log(x); return x }

export const getCurrentDomain = (locationObj) => {
  return locationObj.hostname + (locationObj.port ? ':' + locationObj.port : '')
}

// isLocalEnv :: () -> Boolean
export const isLocalEnv = (currentDomain) => {
  return currentDomain.indexOf(':') !== -1
}

// sanitizeRoute :: String -> String
export const sanitizeRoute = R.curry(route => {
  if (R.last(route) === '/') {
    return R.equals('/', route) ? '/' : R.init(route)
  }
  return route
})

// convertEnvToShortEnv :: String -> String
export const convertEnvToShortEnv = R.compose(R.toLower, R.replace('Domain', ''), R.replace('preview', ''))

// createEncodedQueryStr :: [{*}] -> String
export const createEncodedQueryStr = R.curry(queryObjsArray => {
  return R.tail(queryObjsArray.reduce((prev, curr) => {
    const key = R.head(Object.keys(curr))
    return prev + '&' + key + '=' + encodeURIComponent(curr[key])
  }, ''))
})

// deepKeysEqual :: {*} -> {*} -> {*}
export const deepKeysEqual = R.curry((obj1, obj2) => {
  const shallowKeysEqual = (objA, objB) => {
    // First see which obj has more keys (otherwise, comparison would not be complete)
    const objWithMoreKeys = R.keys(objA).length >= R.keys(objB).length ? objA : objB
    const objWithLessKeys = R.keys(objA).length < R.keys(objB).length ? objA : objB
    return R.keys(objWithMoreKeys).reduce((prev, key) => {
      const sameKeyExistsInTheOtherObj = !R.isNil(R.prop(key, objWithLessKeys))
      if (sameKeyExistsInTheOtherObj) {
        const bothValuesAreObjs = R.is(Object, objA[key]) && !R.isArrayLike(objA[key]) && R.is(Object, objB[key]) && !R.isArrayLike(objB[key])
        if (bothValuesAreObjs) {
          return R.concat(shallowKeysEqual(objA[key], objB[key]), prev)
        } else {
          return R.append(true, prev)
        }
      } else {
        return R.append(false, prev)
      }
    }, [])
  }
  return R.isEmpty(shallowKeysEqual(obj1, obj2).filter(entry => entry === false))
})

// deepCopyValues :: {*} -> {*} -> {*}
export const deepCopyValues = R.curry((fromObj, toObj) => {
  const toObjKeys = R.keys(toObj)
  const deepCopy = toObjKeys.reduce((prev, curr) => {
    const valueInFromObj = R.prop(curr, fromObj)
    if (!R.isNil(valueInFromObj)) { // if this key exists in fromObj
      if (R.keys(valueInFromObj).length > 0) { // if value of this key is an innumerable
        const valueInToObj = R.prop(curr, prev)
        if (R.isArrayLike(valueInFromObj)) { // if value of this key is an array, turn it back into array before returning
          return R.assoc(curr, R.values(deepCopyValues(valueInFromObj, valueInToObj)), prev)
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
    if (!deepKeysEqual(currentPageContent, newSchemaObj)) {
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
  if (R.isNil(rootContent)) { return undefined } // exit immediately if rootContent is undefined

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

// replaceContentSchemaValuesWithPlaceholders :: {*} -> {*}
export const replaceContentSchemaValuesWithPlaceholders = R.curry((contentPlaceholderChar, contentSchema) => {
  // &#8212
  const shallowUpdateValuesWithPlaceholders = R.curry(obj => {
    return R.mapObjIndexed((value, key) => {
      if (R.either(R.is(String), R.is(Number))(value)) {
        return R.replace(/./g, contentPlaceholderChar, value)
      } else if (R.isArrayLike(value)) {
        return R.values(shallowUpdateValuesWithPlaceholders(value))
      } else {
        return shallowUpdateValuesWithPlaceholders(value)
      }
    }, obj)
  })

  return shallowUpdateValuesWithPlaceholders(contentSchema)
})

/* --- IMPURE --------------------------------------------------------------- */

// updatePageContentOnSchemaChange :: {*} -> String -> {*} -> {*} -> IMPURE (send POST request)
export const updatePageContentOnSchemaChange = (localStorageObj, route, rootContent, schemaObj) => {
  if (R.isNil(rootContent)) { return false } // exit immediately if rootContent is undefined

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = getPageContent(sanitizedRoute, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)

  // Only send if contentSchema has changed
  if (!R.isNil(updatedPageContent)) {
    const projectDomain = localStorageObj.getItem('projectDomain')
    const env = localStorageObj.getItem('env')
    const locale = localStorageObj.getItem('locale')
    const contentUpdateObj = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)

    updatePageContent$$(contentUpdateObj).subscribe(
      dbRes => console.log('Successfully updated pageContent in DB! ', dbRes),
      err => console.log('Updating pageContent from schema change failed: ', err)
    )
    return true
  }
  return false
}

/* --- EXPOSED TO USER (IMPURE) --------------------------------------------- */

/*
  1) First on app load, get current domain and run getRootContent()
     -> get projectDetails (using domain, env, locale) and rootContent from DB
  2) Before they arrive, save contentSchema in localStorage (key: contentSchema)
     -> and use it to immediately show content with placeholders (i.e. ----) or default content
  3) When routeContent & projectDetails arrive, save projectDetails, env, isPreview in localStorage and return routeContent
  4) Compare the contentSchema with rootContent in localStorage (use getUpdatedPageContentFromSchemaChange())
  4a) If contentSchema === rootContent, use rootContent to update the displayed content with placeholders
  4b) If contentSchema !== rootContent
    1) Send out the new contentUpdateObj
    2) Use the new contentUpdateObj to show content immediately (i.e. optimistic update)
    * NOTE: Make sure to put setContentSchema above getPageContent
*/

// NO TEST
// useContentPlaceholder :: () -> IMPURE (set localStorage)
export const useContentPlaceholder = () => {
  global.localStorage.setItem('contentPlaceholder', 'true')
}

// NO TEST
// getRootContent :: String -> String -> [*] -> Observable (-> routeContent) + IMPURE (set localStorage)
export const getRootContent = R.curry((projectDomain, route, options) => {
  if (isLocalEnv(getCurrentDomain(global.location))) { console.log('In local environment...') }

  const currentDomain = getCurrentDomain(global.location)
  const {excludedRoutes = [], contentPlaceholder} = options

  // Send a POST request for initial content
  return getInitContent$$(projectDomain, currentDomain, route, excludedRoutes)
    .startWith({projectDetails: {}})
    .flatMap(initContentObj => {
      const {projectDetails, env, locale, isPreview, routeContent} = initContentObj

      // First set localStorage items
      global.localStorage.clear()
      global.localStorage.setItem('contentPlaceholder', contentPlaceholder)
      global.localStorage.setItem('projectDetails', JSON.stringify(projectDetails))
      global.localStorage.setItem('projectDomain', projectDetails.projectDomain)
      global.localStorage.setItem('env', env) // prod or staging
      global.localStorage.setItem('locale', locale) // prod or staging
      global.localStorage.setItem('isPreview', isPreview)

      /*
        If this is PREVIEW, return the initial routeContent and then:
          1) Load socket.io client script
          2) Receive and return subsequent socket.io event for updatedContent
        Otherwise, return the initial routeContent only
      */
      if (isPreview) {
        console.log('In preview...')
        const io = require('socket.io-client')
        const socket = io.connect(config.host + ':' + config.port)
        return getUpdatedContentWS$$(socket).startWith(routeContent)
      } else {
        console.log('Not in preview...')
        return Rx.Observable.return(routeContent)
      }
    })
    .scan(R.merge)
})

// NO TEST
// setContentSchema :: String -> {*} -> {*} -> IMPURE
export const setContentSchema = (route, rootContent, schemaObj) => {
  global.localStorage.setItem('contentSchema', JSON.stringify(schemaObj))
  console.log('contentSchema set!!')
  const currentDomain = getCurrentDomain(global.location)
  updatePageContentOnSchemaChange(global.localStorage, route, rootContent, schemaObj)
}

// NO TEST
// getContent :: String -> {*} -> {*}
export const getContent = R.curry((route, rootContent) => {
  const contentSchema = JSON.parse(global.localStorage.getItem('contentSchema'))

  // Show the content immediately from contentSchema if rootContent hasn't arrived
  if (R.isNil(rootContent)) {
    // Replace contentSchema values with placeholders if contentPlaceholder is true
    console.log('Waiting for rootContent to arrive...')
    if (global.localStorage.getItem('contentPlaceholder') !== 'undefined') {
      const contentPlaceholderChar = global.localStorage.getItem('contentPlaceholder')
      console.log('contentPlaceholder: ', contentPlaceholderChar)
      return replaceContentSchemaValuesWithPlaceholders(contentPlaceholderChar, contentSchema)
    } else {
      return contentSchema
    }
  }

  // First compare the pageContent from DB and contentSchema and
  // show the updatedContent if contentSchema changed (i.e. optimistic update)
  const pageContent = getPageContent(route, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, contentSchema)

  return R.isNil(updatedPageContent) ? pageContent : updatedPageContent
})
