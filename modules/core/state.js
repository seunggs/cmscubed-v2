import R from 'ramda'

/*
  STATE STRUCTURE = {
    global: {},
    ['/route-elemName-id']: {key: value},
    ...
  }
*/

// createUniqueStateIds :: Integer -> String -> [String]
export const createUniqueStateIds = R.curry((numOfElems, pathname) => {
  const startsWithSlash = R.compose(R.equals('/'), R.head)
  const isValidPathName = startsWithSlash(pathname)
  if (!isValidPathName) { throw Error('Please input a valid pathname for createStateId()') }
  return R.range(0, numOfElems).map(num => 'state-' + pathname + '-' + num)
})

// getElemState :: String -> {*} -> {*}
export const getElemState = R.curry((id, rootState) => {
  if (R.isNil(rootState)) { return {} }
  if (R.equals({}, rootState)) { return {} }
  return R.isNil(R.prop(id, rootState)) ? {} : R.prop(id, rootState)
})
