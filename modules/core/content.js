import R from 'ramda'
import socket from '../websockets/'
import locales from './data/locales'

/* NAMING CONVENTIONS
  route (i.e. '/products/hacker')
  path (i.e. '/' or 'hacker'): individual route node
  pathArray (i.e. ['products', 'hacker']): array of paths
  schemaObj: initial content objects whose keys only matter (not values)
  routePageContentPair: [route, pageContent] pair of route and pageContent obj for transfer between client, server, and DB
  oldNewContentPair: [oldContent, [route, newContent]]
  dbBackupObj: an object of mostly meta data inside DB for a changed route (for backup/undo purposes)
  dbContentObj: entry obj in contents table (i.e. {project: 'Project', locale: 'en-US', route: '/', content: {heading: "Home"}})
*/

/* DATA FLOW
  NOTE: pageContent is the unit mostly worked with
  1) Developer flow:
    Client (pageContentSchema -> [oldVal, newVal (routePageContentPair)])
    -> Server (pass through to DB)
    -> DB (update route + add dbBackupObj)
  2) End user flow:
    Client (pageContent -> [oldVal, newVal (routePageContentPair)])
    -> Server (pass through to DB)
    -> DB (update route + add dbBackupObj)
  3) DB to client flow:
    DB (dbContentObjs)
    -> Server (dbContentObjs -> routeContent/pageContent)
    -> Client (routeContent/pageContent)
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
  if (R.last(route) === '/') {
    return R.equals('/', route) ? '/' : R.init(route)
  }
  return route
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

// getUpdatedPageContentFromSchemaChange ::
export const getUpdatedPageContentFromSchemaChange = R.curry((currentPageContent, newSchemaObj) => {
  return R.isNil(currentPageContent) ? newSchemaObj : deepCopyValues(currentPageContent, newSchemaObj)
})

// getProjectRoute :: String -> String
export const getProjectRoute = route => {
  return route.replace('/edit', '') === '/$root' ? '/' : route.replace('/edit', '')
}

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

// createRoutePageContentPair :: String -> {*} -> [*]
export const createRoutePageContentPair = R.curry((route, pageContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  return [sanitizedRoute, pageContent]
})

// createRouteTree :: String -> {*} -> [*]
export const createRouteTree = R.curry(rootContent => {
  const createNestedRoutes = R.curry(rootContent => {
    const routes = R.compose(R.map(sanitizeRoute), R.keys)(rootContent)
    const nestedRoutes = R.reduce((prev, route) => R.assocPath(convertRouteToPathArray(route), {}, prev), {})(routes)
    return nestedRoutes
  })
  const nestedRootContent = createNestedRoutes(rootContent)

  const getChildRoutes = R.curry(obj => {
    // Get all keys of objects that are routeObjs (i.e. who has {$type: 'route'})
    const childRoutes = R.keys(obj)
    return childRoutes.map(key => ({path: key, childRoutes: getChildRoutes(obj[key])}))
  })
  return [{ path: '/', childRoutes: getChildRoutes(nestedRootContent)}]
})

// isValidLocale :: [*] -> String -> Boolean
export const isValidLocale = R.curry(locale => R.indexOf(locale, locales.valid) !== -1)

// convertDBContentObjsToContent :: String -> {*} -> {*}
export const convertDBContentObjsToContent = R.curry(dbContentObjs => {
  const content = dbContentObjs.reduce((prev, dbContentObj) => {
    return R.assoc(R.prop('route', dbContentObj), R.prop('content', dbContentObj), prev)
  }, {})
  return content
})

// isContent :: {*} -> Boolean
export const isContent = R.curry(input => {
  if (R.is(Object, input) && !R.isEmpty(input)) {
    const startsWithSlash = R.compose(R.equals('/'), R.head)
    return R.compose(startsWithSlash, R.head, R.keys)(input)
  } else {
    return false
  }
})

/* --- IMPURE --------------------------------------------------------------- */

// TODO: add test
export const sendPageContent = R.curry((oldPageContent, routePageContentPair) => {
  socket.emit('pageContent:update', {oldVal: oldPageContent, newVal: routePageContentPair})
  return 'sent'
})

// setContentSchema :: String -> {*} -> {*} -> String
export const setContentSchema = R.curry((route, rootContent, schemaObj) => {
  const pageContent = getPageContent(route, rootContent)
  const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)
  const routePageContentPair = createRoutePageContentPair(route, updatedPageContent)
  // Only send if content has changed
  if (JSON.stringify(pageContent) !== JSON.stringify(updatedPageContent)) {
    sendPageContent(pageContent, routePageContentPair)
    return 'sent'
  }
  return 'not sent'
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
  matrix: [ // put matrix option in the UI?
    ['Pro 11', 'Pro 12'],
    ['Pro 21', 'Pro 22']
  ]
}
