import R from 'ramda'
import socket from '../config/websockets'

/* NAMING CONVENTIONS
  c3 object (i.e. rootC3Obj vs rootContent): proprietary object format that includes $type, and array as object with numeric keys
  route (i.e. '/products/hacker')
  path (i.e. '/' or 'hacker'): individual route node
  pathArray (i.e. ['products', 'hacker']): array of paths
  routeObj (i.e. {'home': {$type: 'route'}}): objects with {$type: 'route'}
  schemaObj: initial content objects whose keys only matter (not values) - this is NOT a c3Obj
  changeObj: an object of mostly meta data inside DB for a changed route (for backup purposes)
*/

/* DATA FLOW
  1) Developer flow:
    Client (pageSchema -> list of add/remove paths in c3Obj format ([pathArray, c3ObjValue]))
    -> Server (add/remove paths from relevant pageContents -> create an array of all routes to be updated in DB)
    -> DB (update individual routes + add changeObj)
  2) End user flow:
    Client (pageContent -> pageC3Obj)
    -> Server (convert pageC3Obj to {route: pageContent} for DB)
    -> DB (update individual route + add changeObj)
  3) DB to client flow:
    DB (send all routes)
    -> Server (convert to rootC3Obj)
    -> Client (rootC3Obj)
*/

const log = x => { console.log(x); return x }

// convertQueryToPathArray :: String -> [String]
export const convertQueryToPathArray = R.compose(R.map(R.trim), R.split(','), R.replace(']', ''), R.replace('[', ''))

// convertPathArrayToRoute :: [String] -> String
export const convertPathArrayToRoute = R.compose(R.reduce(R.add, ''), R.map(R.add('/')))

// convertRouteToPathArray :: String -> [String]
export const convertRouteToPathArray = R.compose(R.reject(R.isEmpty), R.split('/'))

// convertArrayToObject :: [*] -> {*}
export const convertArrayToObject = R.curry(arr => {

})

// diffC3ObjKeysForAdding :: [*] -> {*} -> {*} -> [*]
export const diffC3ObjKeysForAdding = R.curry((pathArray, oldObj, newObj) => {
  const oldObjKeys = R.keys(oldObj)
  const newObjKeys = R.keys(newObj)
  const keysToBeAdded = R.difference(newObjKeys, oldObjKeys)
  const intersectionKeys = R.intersection(oldObjKeys, newObjKeys)
  const intersectionChildRouteKeys = intersectionKeys
    .filter(key => R.whereEq({$type: 'route'}, newObj[key]))

  const childRouteKeysForAdding = R.chain(key => {
    return diffC3ObjKeysForAdding(R.append(key, pathArray), oldObj[key], newObj[key])
  })(intersectionChildRouteKeys)

  const tuplesForAdding = keysToBeAdded.map(key => [R.append(key, pathArray), newObj[key]])
  return R.concat(tuplesForAdding, childRouteKeysForAdding)
})

// diffC3ObjKeysForRemoving :: [*] -> {*} -> {*} -> [*]
export const diffC3ObjKeysForRemoving = R.curry((pathArray, oldObj, newObj) => {
  const oldObjKeys = R.keys(oldObj)
  const newObjKeys = R.keys(newObj)
  const keysToBeRemoved = R.difference(oldObjKeys, newObjKeys)
  const intersectionKeys = R.intersection(oldObjKeys, newObjKeys)
  const intersectionChildRouteKeys = intersectionKeys
    .filter(key => R.whereEq({$type: 'route'}, newObj[key]))

  const childRouteTuplesForRemoving = R.chain(key => {
    return diffC3ObjKeysForRemoving(R.append(key, pathArray), oldObj[key], newObj[key])
  })(intersectionChildRouteKeys)

  const tuplesForRemoving = keysToBeRemoved.map(key => [R.append(key, pathArray), oldObj[key]])
  return R.concat(tuplesForRemoving, childRouteTuplesForRemoving)
})

// convertContentToC3Obj :: String -> {*} -> {*}
// caveat: this func will only convert the objects along the given route, not the entire given content object
export const convertContentToC3Obj = R.curry((route, content) => {
  // addRouteType :: String -> {*} -> {*}
  const addRouteType = R.curry((route, rootContent) => {
    const pathArray = convertRouteToPathArray(route)
    const progressivePathList = R.scan((prev, curr) => {
      return prev.concat(curr)
    }, [])(pathArray)

    // add {$type: route} along the path
    const newRootContent = R.reduce((prev, curr) => {
      return R.assocPath(curr.concat('$type'), 'route', prev)
    }, rootContent)(progressivePathList)
    return newRootContent
  })

  const c3Obj = addRouteType(route, content)
  return c3Obj
})

// convertC3ObjToContent :: String -> {*} -> {*}
export const convertC3ObjToContent = R.curry(c3Obj => {
  // removeRouteType :: String -> {*} -> {*}
  // Recursively removes all {$type: 'route'} in a given object
  const removeRouteType = R.curry(c3Obj => {
    // Omit {$type: 'route'} on this level only
    const allKeys = R.keys(c3Obj)
    const keysWithoutRouteType = R.reject(key => key === '$type' && c3Obj[key] === 'route', allKeys)
    const content = keysWithoutRouteType.reduce((prev, curr) => {
      return R.merge(prev, {[curr]: c3Obj[curr]})
    }, {})

    // get child routes
    const contentKeys = R.keys(content)
    const childRouteKeys = contentKeys
      .filter(key => R.whereEq({$type: 'route'}, content[key]))
    const childRoutes = childRouteKeys.map(key => {return {[key]: content[key]}})

    // Omit {$type: 'route'} on all child routes
    const finalContent = childRouteKeys
      .map(key => {return {[key]: removeRouteType(content[key])}})
      .reduce((prev, curr) => {
        const childRouteKey = R.keys(curr)
        return R.merge(prev, {[childRouteKey]: curr[childRouteKey]})
      }, content)
    return finalContent
  })

  return removeRouteType(c3Obj)
})

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const pathArray = convertRouteToPathArray(route)
  const pageC3Obj = pathArray.reduce((prev, curr) => prev[curr], rootContent)

  // // removeChildRoutes :: {*} -> {*}
  // const removeChildRoutes = R.curry(c3Obj => {
  //   const allKeys = R.keys(c3Obj)
  //   const keysWithoutChildRoutes = R.reject(key => R.whereEq({$type: 'route'}, pageC3Obj[key]))(allKeys)
  //   const content = keysWithoutChildRoutes.reduce((prev, curr) => {
  //     return R.merge(prev, {[curr]: pageC3Obj[curr]})
  //   }, {})
  //   return content
  // })
  //
  // const pageC3ObjWithoutChildRoutes = removeChildRoutes(pageC3Obj)

  const pageContent = convertC3ObjToContent(pageC3Obj)
  return pageContent
})

// createRouteTree :: String -> {*} -> [*]
export const createRouteTree = R.curry(rootC3Obj => {
  const isRouteObj = obj => R.whereEq({$type: 'route'}, obj)
  const getChildRoutes = R.curry(obj => {
    // Get all keys of objects that are routeObjs (i.e. who has {$type: 'route'})
    const allKeys = R.keys(obj)
    const childRouteKeys = allKeys.filter(key => isRouteObj(obj[key]))
    // Convert each key into path obj (i.e. {path: 'about', childRoutes: []})
    return childRouteKeys.map(key => {
      return {
        path: key,
        childRoutes: getChildRoutes(obj[key])
      }
    })
  })

  return isRouteObj(rootC3Obj) ? [{ path: '/', childRoutes: getChildRoutes(rootC3Obj)}] : []
})

// addPageContentToRootContent :: String -> {*} -> {*} -> {*}
export const addPageContentToRootContent = R.curry((route, rootContent, pageContent) => {
  const pathArray = convertRouteToPathArray(route)
  const newRootContent = R.assocPath(pathArray, pageContent, rootContent)
  return newRootContent
})

// routeExists :: {*} -> String -> Boolean
export const routeExists = (c3Obj, route) => {
  return R.compose(R.not, R.isNil, R.path(R.__, c3Obj), convertRouteToPathArray)(route)
}

// getContentKeysToAdd :: String -> {*} -> {*} -> [*]
export const getContentKeysToAdd = R.curry((route, rootC3Obj, schemaObj) => {
  const pathArray = convertRouteToPathArray(route)
  if (routeExists(rootC3Obj, route)) {
    const pageC3Obj = R.path(pathArray, rootC3Obj)
    const schemaC3Obj = R.merge(schemaObj, {$type: 'route'})
    return diffC3ObjKeysForAdding(pathArray, pageC3Obj, schemaC3Obj)
  } else {
    // First add {$type: 'route'} to root of schemaObj
    const schemaC3Obj = R.merge(schemaObj, {$type: 'route'})
    return [[pathArray, schemaC3Obj]]
  }
})

// getContentKeysToRemove :: String -> {*} -> {*} -> [*]
export const getContentKeysToRemove = R.curry((route, rootC3Obj, schemaObj) => {
  const pathArray = convertRouteToPathArray(route)
  if (routeExists(rootC3Obj, route)) {
    const pageC3Obj = R.path(pathArray, rootC3Obj)
    const schemaC3Obj = R.merge(schemaObj, {$type: 'route'})
    return diffC3ObjKeysForRemoving(pathArray, pageC3Obj, schemaC3Obj)
  } else {
    return null
  }
})

// addKeysToC3Obj :: [*] -> {*} -> {*}
export const addKeysToC3Obj = R.curry((keysToAdd, rootC3Obj) => {
  const newRootC3Obj = keysToAdd.reduce((prev, curr) => {
    const pathArray = R.head(curr)
    const value = R.last(curr)
    return R.assocPath(pathArray, value, prev)
  }, rootC3Obj)
  return newRootC3Obj
})

/* --- IMPURE --------------------------------------------------------------- */

// TODO: add test
// setContentSchema :: String -> {*} -> {*} -> IMPURE (Send socket.io events)
export const setContentSchema = R.curry((route, rootC3Obj, schemaObj) => {
  const contentKeysToAdd = getContentKeysToAdd(route, rootC3Obj, schemaObj)
  const contentKeysToRemove = getContentKeysToRemove(route, rootC3Obj, schemaObj)
  if (!R.isNil(contentKeysToAdd) && !R.isEmpty(contentKeysToAdd)) { socket.emit('addContentKeys', contentKeysToAdd) }
  if (!R.isNil(contentKeysToRemove) && !R.isEmpty(contentKeysToRemove)) { socket.emit('removeContentKeys', contentKeysToRemove) }
})


// TODO: remove it later
const testEntry2 = {
  heading: 'Pro heading',
  text: 'Pro text',
  subContent: {
    text: 'Pro sub content'
  },
  list: [
    'Pro list item 1',
    {innerText: 'Pro list item 2'}
  ],
  matrix: [
    {$type: 'matrix'},
    ['Pro 11', 'Pro 12'],
    ['Pro 21', 'Pro 22']
  ]
}
