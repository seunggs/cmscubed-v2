import R from 'ramda'
import socket from '../config/websockets'

/* NAMING CONVENTIONS
  route (i.e. '/products/hacker')
  path (i.e. '/' or 'hacker'): individual route node
  pathArray (i.e. ['products', 'hacker']): array of paths
  schemaObj: initial content objects whose keys only matter (not values)
  routePageContentPair: [route, pageContent] pair of route and pageContent obj for transfer between client, server, and DB
  changeObj: an object of mostly meta data inside DB for a changed route (for backup purposes)
*/

/* DATA FLOW
  1) Developer flow:
    Client (pageContentSchema -> routePageContentPair (i.e. [route, pageContent]))
    -> Server (pass through to DB)
    -> DB (update route + add changeObj)
  2) End user flow:
    Client (pageContent -> routePageContentPair (i.e. [route, pageContent]))
    -> Server (pass through to DB)
    -> DB (update route + add changeObj)
  3) DB to client flow:
    DB (send all routes in a given entry point)
    -> Server (pass through to client)
    -> Client (rootContent)
*/

const log = x => { console.log(x); return x }

// convertQueryToPathArray :: String -> [String]
export const convertQueryToPathArray = R.compose(R.map(R.trim), R.split(','), R.replace(']', ''), R.replace('[', ''))

// convertPathArrayToRoute :: [String] -> String
export const convertPathArrayToRoute = R.compose(R.reduce(R.add, ''), R.map(R.add('/')))

// convertRouteToPathArray :: String -> [String]
export const convertRouteToPathArray = R.compose(R.reject(R.isEmpty), R.split('/'))

// sanitizeRoute :: String -> String
export const sanitizeRoute = R.curry(route => {
  if (R.last(route) === '/') { return R.init(route) }
  return route
})

// deepCopyValues :: {*} -> {*} -> {*}
export const deepCopyValues = R.curry((fromObj, toObj) => {
  const convertBackToArray = obj => R.keys(obj).reduce((prev, curr) => prev.concat(R.prop(curr, obj)), [])
  const toObjKeys = R.keys(toObj)
  const deepCopy = toObjKeys.reduce((prev, curr) => {
    const valueInFromObj = R.prop(curr, fromObj)
    if (!R.isNil(valueInFromObj)) {
      // if this key exists in fromObj
      if (R.keys(valueInFromObj).length > 0) {
        // if value of this key is an innumerable
        const valueInToObj = R.prop(curr, prev)
        if (R.isArrayLike(valueInFromObj)) {
          // if value of this key is an array, turn it back into array before returning
          return R.assoc(curr, convertBackToArray(deepCopyValues(valueInFromObj, valueInToObj)), prev)
        } else {
          // if value of this key is an object
          return R.assoc(curr, deepCopyValues(valueInFromObj, valueInToObj), prev)
        }
      } else {
        // if value of this key is a primitive
        return R.assoc(curr, R.prop(curr, fromObj), prev)
      }
    } else {
      // if this key doesn't exist in fromObj
      return prev
    }
  }, toObj)
  return deepCopy
})

export const getUpdatedPageContentFromSchemaChange = R.curry((currentPageContent, newSchemaObj) => {
  return R.isNil(currentPageContent) ? newSchemaObj : deepCopyValues(currentPageContent, newSchemaObj)
})

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const pageContent = R.prop(route, rootContent)
  return pageContent
})

// createRoutePageContentPair :: String -> {*} -> [*]
export const createRoutePageContentPair = R.curry((route, pageContent) => {

})

// createRouteTree :: String -> {*} -> [*]
export const createRouteTree = R.curry(rootC3Obj => {

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
