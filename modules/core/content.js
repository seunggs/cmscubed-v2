import R from 'ramda'
import socket from '../websockets/'
import locales from './data/locales'
import parseDomain from 'parse-domain'
import {convertCamelCaseToTitleCase} from '../utils/'

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

// sanitizeDomain :: String -> String
export const sanitizeDomain = R.curry(inputDomain => {
  const {subdomain, domain, tld} = parseDomain(inputDomain)
  return R.compose(R.join('.'), R.reject(R.either(R.isNil, R.isEmpty)))([subdomain, domain, tld])
})

// convertRouteToPathArray :: String -> [String]
export const convertRouteToPathArray = R.compose(R.reject(R.isEmpty), R.split('/'))

// getProjectRoute :: String -> String
export const getProjectRoute = params => {
  return params === '$root' ? '/' : '/' + params.replace(/\$\$/g, '/')
}

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

// createContentUpdateObj :: String -> String -> String -> {*} -> [*]
export const createContentUpdateObj = R.curry((project, locale, route, pageContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  return [project, locale, sanitizedRoute, pageContent]
})

// createRouteTree :: {*} -> [*]
export const createRouteTree = R.curry(rootContent => {
  const createNestedRoutes = R.curry(rootContent => {
    const routes = R.compose(R.map(sanitizeRoute), R.keys)(rootContent)
    const nestedRoutes = R.reduce((prev, route) => R.assocPath(convertRouteToPathArray(route), {}, prev), {})(routes)
    return nestedRoutes
  })
  const nestedRootContent = createNestedRoutes(rootContent)

  const getChildRoutes = R.curry((prevRoute, obj) => {
    const childRoutes = R.keys(obj)
    return childRoutes.map(key => {
      const route = prevRoute + '/' + key
      return {path: key, route: route, childRoutes: getChildRoutes(route, obj[key])}
    })
  })
  return [{ path: '/', route: '/', childRoutes: getChildRoutes('', nestedRootContent)}]
})

// isValidLocale :: [*] -> String -> Boolean
export const isValidLocale = R.curry(locale => R.indexOf(locale, locales.valid) !== -1)

// convertDBContentObjsToContent :: String -> {*} -> {*}
export const convertDBContentObjsToContent = R.curry(dbContentObjs => {
  if (R.isEmpty(dbContentObjs)) { return {} }

  const content = dbContentObjs.reduce((prev, dbContentObj) => {
    return R.assoc(R.prop('route', dbContentObj), R.prop('content', dbContentObj), prev)
  }, {})

  return content
})

// convertPageContentToContentFields :: {*} -> {*}
export const convertPageContentToContentFields = R.curry(pageContent => {
  const flattenObjWithKeyConnector = (keyConnector, objKey, obj) => {
    const keys = R.keys(obj)
    const flattenedObj = keys.reduce((prev, curr) => {
      const val = obj[curr]
      // If the value is an obj
      if (R.is(Object, val)) {
        return R.merge(prev, flattenObjWithKeyConnector(keyConnector, objKey + (R.equals(objKey, '') ? '' : keyConnector) + curr, val))
      } else {
        // Only add a keyConnector on depth > 1
        return R.merge(prev, {[objKey + (R.equals(objKey, '') ? '' : keyConnector) + curr]: val})
      }
    }, {})
    return flattenedObj
  }
  return flattenObjWithKeyConnector('$', '', pageContent)
})

// convertFieldKeyToTitleCase :: String -> String
export const convertFieldKeyToTitleCase = R.compose(R.join(' '), R.map(convertCamelCaseToTitleCase), R.split('$'))

// // getContentFieldKeys :: {*} -> {*}
// const getContentFieldKeys = R.curry(contentFieldObj => {
//   const keys = R.keys(contentFieldObj)
//   return keys.reduce((prev, key) => R.merge(prev, {[key]: R.replace(/\$/g, '.', key)}), {})
// })
