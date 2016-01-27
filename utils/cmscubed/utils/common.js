import R from 'ramda'

/* Naming conventions:
  c3Obj: proprietary object format that includes $type, and array as object with numeric keys
*/

const log = x => { console.log(x); return x }

// getPathFromQuery :: String -> [String]
export const convertQueryToPath = R.compose(R.map(R.trim), R.split(','), R.replace(']', ''), R.replace('[', ''))

// convertPathToRoute :: [String] -> String
export const convertPathToRoute = R.compose(R.reduce(R.add, ''), R.map(R.add('/')))

// convertRouteToPath :: String -> [String]
export const convertRouteToPath = R.compose(R.reject(R.isEmpty), R.split('/'))

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const routeArray = convertRouteToPath(route.path)
  return routeArray.reduce((prev, curr) => prev[curr], rootContent)
})

// convertObjToC3Obj :: String -> {*} -> {*}
export const convertObjToC3Obj = R.curry((route, pageContent) => {
})

// setPageContent :: IMPURE
export const setPageContent = R.curry((route, pageContent) => {

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
