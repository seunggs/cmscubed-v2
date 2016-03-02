import R from 'ramda'
import Rx from 'rx-lite'
import config from './config'
import {
  updatePageContent$$,
  getInitContent$$,
  getUpdatedRouteContentWS$$,
  getUpdatedContentFieldWS$$,
  checkIsPreview$,
  loadSocketIoClient$
} from './observables'

/* --- PURE ----------------------------------------------------------------- */

const log = x => { console.log(x); return x }

// getCurrentDomain :: {*} -> String
export const getCurrentDomain = (locationObj) => {
  return locationObj.hostname + (locationObj.port ? ':' + locationObj.port : '')
}

// checkIsLocalEnv :: {*} -> Boolean
export const checkIsLocalEnv = (currentDomain) => {
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
// export const convertEnvToShortEnv = R.compose(R.toLower, R.replace('Domain', ''), R.replace('preview', ''))
export const convertEnvToShortEnv = R.compose(R.toLower, R.replace('Domain', ''))

// createEncodedQueryStr :: [{*}] -> String
export const createEncodedQueryStr = R.curry(queryObjsArray => {
  return R.tail(queryObjsArray.reduce((prev, curr) => {
    const key = R.head(Object.keys(curr))
    return prev + '&' + key + '=' + encodeURIComponent(curr[key])
  }, ''))
})

// checkIsInteger :: * -> Boolean
export const checkIsInteger = R.curry(value => {
  if (isNaN(value)) { return false }
  var x = parseFloat(value)
  return (x | 0) === x
})

// checkIsObjectifiedArray :: {*} -> Boolean
export const checkIsObjectifiedArray = R.curry(obj => {
  if (!R.is(Object, obj) || R.isArrayLike(obj)) { return false }
  const keys = R.keys(obj)
  return R.compose(R.isEmpty, R.reject(checkIsInteger))(keys)
})

// // deepKeysEqual :: {*} -> {*} -> {*}
// export const deepKeysEqual = R.curry((obj1, obj2) => {
//   const keysEqual = (objA, objB) => {
//     // First see which obj has more keys (otherwise, comparison would not be complete)
//     const objWithMoreKeys = R.keys(objA).length >= R.keys(objB).length ? objA : objB
//     const objWithLessKeys = R.keys(objA).length < R.keys(objB).length ? objA : objB
//     return R.keys(objWithMoreKeys).reduce((prev, key) => {
//       const sameKeyExistsInTheOtherObj = !R.isNil(R.prop(key, objWithLessKeys))
//       if (sameKeyExistsInTheOtherObj) {
//         const bothValuesAreObjs = R.is(Object, objA[key]) && R.is(Object, objB[key])
//         if (bothValuesAreObjs) {
//           const onlyOneValueIsAnArray = (R.isArrayLike(objA[key]) && !R.isArrayLike(objB[key])) || (!R.isArrayLike(objA[key]) && R.isArrayLike(objB[key]))
//           if (onlyOneValueIsAnArray) {
//             return R.append(false, prev)
//           }
//           return R.concat(keysEqual(objA[key], objB[key]), prev)
//         } else {
//           return R.append(true, prev)
//         }
//       } else {
//         return R.append(false, prev)
//       }
//     }, [])
//   }
//   return R.isEmpty(keysEqual(obj1, obj2).filter(entry => entry === false))
// })

// TODO: add test
// checkIsArray :: * -> Boolean
export const checkIsArray = R.either(R.isArrayLike, checkIsObjectifiedArray)

// checkIsObjButNotArray :: * -> Boolean
export const checkIsObjButNotArray = R.both(R.is(Object), R.complement(checkIsArray))

// checkIsPrimitive :: * -> Boolean
export const checkIsPrimitive = R.complement(R.is(Object))

// checkContainsArray :: * -> Boolean
export const checkContainsArray = R.curry(input => {
  if (checkIsPrimitive(input)) { return false }
  if (checkIsArray(input)) { return true }
  const keys = R.keys(input)
  const listOfTOrF = keys.reduce((prev, curr) => {
    const val = input[curr]
    if (checkIsPrimitive(val)) {
      return R.append(false, prev)
    } else if (checkIsArray(val)) {
      return R.append(true, prev)
    } else {
      // If it's an object but not array
      return R.append(checkContainsArray(val), prev)
    }
  }, [])
  return !R.isEmpty(R.filter(item => item === true, listOfTOrF))
})

// deepKeysEqual :: {*} -> {*} -> {*}
export const deepKeysEqual = R.curry((obj1, obj2) => {
  const keysEqual = (objA, objB) => {
    // First see which obj has more keys (otherwise, comparison would not be complete)
    const objWithMoreKeys = R.keys(objA).length >= R.keys(objB).length ? objA : objB
    const objWithLessKeys = R.keys(objA).length < R.keys(objB).length ? objA : objB
    return R.keys(objWithMoreKeys).reduce((prev, key) => {
      /*
        obj + obj = Continue recursion
        obj + arr = F
        obj + prim = F
        arr + arr = Special case (allowed to have diff keys)
        arr + prim = F
        prim + prim = T
      */
      const sameKeyExistsInTheOtherObj = !R.isNil(R.prop(key, objWithLessKeys))

      const objAVal = objA[key]
      const objBVal = objB[key]

      const objAndObj = checkIsObjButNotArray(objAVal) && checkIsObjButNotArray(objBVal)
      const objAndArr = (checkIsObjButNotArray(objAVal) && checkIsArray(objBVal)) || (checkIsObjButNotArray(objBVal) && checkIsArray(objAVal))
      const objAndPrim = (checkIsObjButNotArray(objAVal) && checkIsPrimitive(objBVal)) || (checkIsObjButNotArray(objBVal) && checkIsPrimitive(objAVal))
      const arrAndArr = checkIsArray(objAVal) && checkIsArray(objBVal)
      const arrAndPrim = (checkIsArray(objAVal) && checkIsPrimitive(objBVal)) || (checkIsArray(objBVal) && checkIsPrimitive(objAVal))
      const primAndPrim = checkIsPrimitive(objAVal) && checkIsPrimitive(objBVal)

      if (sameKeyExistsInTheOtherObj) {
        if (primAndPrim) {
          return R.append(true, prev)
        } else if (objAndArr || objAndPrim || arrAndPrim) {
          return R.append(false, prev)
        }
        // i.e. objAndObj || arrAndArr
        return R.concat(keysEqual(objAVal, objBVal), prev)
      } else {
        // The key here is diff key
        const diffKeyVal = objWithMoreKeys[key]

        // If the parent obj is not an array, diff key means diff obj so return false
        if (!checkIsArray(objWithMoreKeys)) { return R.append(false, prev) }

        // This is the special case for arrays; only arrays are allowed to have differing keys
        // If any of the differing keys have values that contain arrays, return false; otherwise, return true
        const diffKeyContainsArray = checkContainsArray(diffKeyVal)
        return diffKeyContainsArray ? R.append(false, prev) : R.append(true, prev)
      }
    }, [])
  }
  return R.isEmpty(keysEqual(obj1, obj2).filter(entry => entry === false))
})

// deepCopyValues :: {*} -> {*} -> {*}
// fromObj value persists and toObj key persists
// EXCEPTION: if the obj is objectified array, then fromObj key persists - this is to allow content creator to add array items
export const deepCopyValues = R.curry((fromObj, toObj) => {
  const toObjKeys = R.keys(toObj)
  const deepCopy = toObjKeys.reduce((prev, curr) => {
    const valueInFromObj = R.prop(curr, fromObj)

    if (!R.isNil(valueInFromObj)) { // if this key exists in fromObj
      if (R.keys(valueInFromObj).length > 0) { // if value of this key is an innumerable
        const valueInToObj = R.prop(curr, prev)
        if (checkIsObjectifiedArray(valueInFromObj)) {
          // if the value is an objectified array, fromObj key persists (unlike any other case)
          const excessKeys = R.symmetricDifference(R.keys(valueInFromObj), R.keys(valueInToObj))
          if (R.keys(valueInFromObj).length > R.keys(valueInToObj).length) {
            // if fromObj has more keys, add extra keys to toObj before doing further deep copy
            const newValueInToObj = excessKeys.reduce((prev, curr) => R.merge(prev, {[curr]: valueInFromObj[curr]}), valueInToObj)
            return R.assoc(curr, deepCopyValues(valueInFromObj, newValueInToObj), prev)
          } else if (R.keys(valueInFromObj).length < R.keys(valueInToObj).length) {
            // if fromObj has less keys, remove excess keys from toObj before doing further deep copy
            const newValueInToObj = R.omit(excessKeys, valueInToObj)
            return R.assoc(curr, deepCopyValues(valueInFromObj, newValueInToObj), prev)
          }
        }
        return R.assoc(curr, deepCopyValues(valueInFromObj, valueInToObj), prev)
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
  // TODO: const objectifiedNewSchemaObj = deepObjectifyArrays(newSchemaObj)
  if (R.isNil(currentPageContent)) {
    return newSchemaObj
  } else {
    // only run deepCopyValues if schemaObj has changed
    if (!deepKeysEqual(currentPageContent, newSchemaObj)) {
      console.log('schemaObj changed!')
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

// deepObjectifyArrays :: {*} -> {*}
export const deepObjectifyArrays = R.curry(obj => {
  const objectifyArrays = obj => {
    const keys = R.keys(obj)
    return keys.reduce((prev, curr) => {
      const val = obj[curr]
      if (R.is(Object, val)) {
        return R.merge(prev, {[curr]: objectifyArrays(val)})
      } else {
        return R.merge(prev, {[curr]: val})
      }
    }, {})
  }
  return objectifyArrays(obj)
})

// deepDeobjectifyArrays :: {*} -> {*}
export const deepDeobjectifyArrays = R.curry(obj => {
  const deobjectifyArrays = obj => {
    const keys = R.keys(obj)
    if (checkIsObjectifiedArray(obj) || R.isArrayLike(obj)) {
      return keys.reduce((prev, curr) => {
        const val = obj[curr]
        if (R.is(Object, val)) {
          return R.concat(prev, deobjectifyArrays(val))
        } else {
          return R.concat(prev, val)
        }
      }, [])
    } else {
      return keys.reduce((prev, curr) => {
        const val = obj[curr]
        if (R.is(Object, val)) {
          return R.merge(prev, {[curr]: deobjectifyArrays(val)})
        } else {
          return R.merge(prev, {[curr]: val})
        }
      }, {})
    }
  }
  return deobjectifyArrays(obj)
})

/* --- IMPURE --------------------------------------------------------------- */

// sendCrossDomainEvent :: {*} -> * -> String -> IMPURE (cross domain event)
export const sendCrossDomainEvent = (receivingWindow, msg, targetUrl) => {
  receivingWindow.postMessage(msg, targetUrl)
}

// updatePageContentOnSchemaChange :: {*} -> String -> {*} -> {*} -> IMPURE (send POST request)
export const updatePageContentOnSchemaChange = (localStorageObj, route, rootContent, schemaObj) => {
  if (R.isNil(rootContent)) { return false } // exit immediately if rootContent is undefined

  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = getPageContent(sanitizedRoute, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)

  // Only send if contentSchema has changed (i.e. keys), but NOT content fields (i.e. values)
  if (!R.isNil(updatedPageContent)) {
    const projectDomain = localStorageObj.getItem('projectDomain')
    const env = localStorageObj.getItem('env')
    const locale = localStorageObj.getItem('locale')

    if (projectDomain !== 'undefined' && env !== 'undefined' && locale !== 'undefined') {
      const contentUpdateObj = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)
      updatePageContent$$(contentUpdateObj).subscribe(
        dbRes => console.log('Successfully updated pageContent in DB! ', dbRes),
        err => console.log('Updating pageContent from schema change failed: ', err)
      )
      return true
    }
    return false
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
  if (checkIsLocalEnv(getCurrentDomain(global.location))) { console.log('In local environment...') }

  const currentDomain = getCurrentDomain(global.location)
  const {excludedRoutes = [], contentPlaceholder} = options

  // Send a POST request for initial content
  const getInitContent$ = getInitContent$$(projectDomain, currentDomain, route, excludedRoutes)
    .startWith({projectDetails: {}})
    .map(initContentObj => {
      const {projectDetails, env, locale, routeContent} = initContentObj

      // First set localStorage items
      global.localStorage.clear()
      global.localStorage.setItem('contentPlaceholder', contentPlaceholder)
      global.localStorage.setItem('projectDetails', JSON.stringify(projectDetails))
      global.localStorage.setItem('projectDomain', projectDetails.projectDomain)
      global.localStorage.setItem('env', env) // prod or staging
      global.localStorage.setItem('locale', locale)

      // Send preview page ready event to parent
      // This will cause the parent to send back isPreview event, which will kick off loading of preview script
      const cmsWindow = global.parent
      cmsWindow.postMessage('previewPage:ready', '*')

      return routeContent
    })

  /*
    To check if it's a PREVIEW:
      1) Send page ready event to parent window (cms)
      2) If this receives a cross domain message 'isPreview' back from the parent (cms), then it's PREVIEW.
    If this is PREVIEW:
      1) Load socket.io client script
      2) Receive and return subsequent socket.io event for updatedContent (further routeContent & content field updates)
  */
  const getUpdatedContentWS$ = checkIsPreview$
    .flatMap(e => {
      if (!R.isNil(e)) {
        console.log('In preview...')
        // Save it in localStorage
        global.localStorage.setItem('inPreview', 'true')

        // Dynamically load socket.io client script here if it's not already loaded
        if (typeof(io) === 'undefined') {
          console.log('Loading socket.io client...')
          return loadSocketIoClient$
            .flatMap(() => {
              console.log('socket.io loaded!')
              // const socket = io.connect(config.host + ':' + config.port)
              // Once socket.io client is loaded, report back to the parent (cms)
              e.source.postMessage('socketio:loaded', e.origin)

              return getUpdatedRouteContentWS$$(socket)
            })
        } else {
          console.log('socket.io client already loaded')
          // const socket = io.connect(config.host + ':' + config.port)
          // If socket.io is already loaded, report back to the parent (cms)
          e.source.postMessage('socketio:loaded', e.origin)

          return getUpdatedRouteContentWS$$(socket)
        }
      } else {
        return Rx.Observable.return({})
      }
    })

  return Rx.Observable
    .merge(getInitContent$, getUpdatedContentWS$)
    .scan(R.merge)
})

// NO TEST
// setContentSchema :: String -> {*} -> {*} -> IMPURE
export const setContentSchema = (route, rootContent, schemaObj) => {
  global.localStorage.setItem('contentSchema', JSON.stringify(schemaObj))
  console.log('contentSchema set!!')
  const currentDomain = getCurrentDomain(global.location)
  // objectify arrays in schemaObj before saving
  updatePageContentOnSchemaChange(global.localStorage, route, rootContent, deepObjectifyArrays(schemaObj))
}

// NO TEST
// getContent :: String -> {*} -> {*}
export const getContent = R.curry((route, rootContent) => {
  const contentSchema = JSON.parse(global.localStorage.getItem('contentSchema'))

  // Show the content immediately from contentSchema if rootContent hasn't arrived
  if (R.isNil(rootContent) || R.isEmpty(rootContent)) {
    // Replace contentSchema values with placeholders if contentPlaceholder is true
    if (global.localStorage.getItem('contentPlaceholder') !== 'undefined') {
      const contentPlaceholderChar = global.localStorage.getItem('contentPlaceholder')
      return replaceContentSchemaValuesWithPlaceholders(contentPlaceholderChar, contentSchema)
    } else {
      // Convert the objectified arrays back into real arrays before returning (only needed for getContent)
      return deepDeobjectifyArrays(contentSchema)
    }
  }

  // First compare the pageContent from DB and contentSchema and
  // show the updatedContent if contentSchema changed (i.e. optimistic update)
  const pageContent = getPageContent(route, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, contentSchema)

  // TODO
  /*
    If preview, use the override content for field updates
      1) If isPreview, subscribe to field update observable
      2) On field update, accumulate the value for pageContent in localStorage and return that
  */
  if (global.localStorage.getItem('inPreview') === 'true') {
    const socket = io.connect(config.host + ':' + config.port)
    getUpdatedContentFieldWS$$(socket).subscribe(fieldObj => {
      const {projectRoute, keyPath, value} = fieldObj
      if (route === projectRoute) {

      }
    })
  }

  // Convert the objectified arrays back into real arrays before returning (only needed for getContent)
  return R.isNil(updatedPageContent) ? deepDeobjectifyArrays(pageContent) : deepDeobjectifyArrays(updatedPageContent)
})
