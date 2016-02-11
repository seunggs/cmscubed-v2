import R from 'ramda'

// createStateIds :: String -> [String]
export const createStateIds = R.curry((numOfFormElems, pathname) => {
  const startsWithSlash = R.compose(R.equals('/'), R.head)
  const isValidPathName = startsWithSlash(pathname)
  if (!isValidPathName) { throw Error('Please input a valid pathname for createStateId()') }
  return R.range(0, numOfFormElems).map(num => 'state-' + pathname + '-' + num)
})

// getElemState :: String -> {*} -> {*}
export const getElemState = R.curry((id, rootState) => {
  if (R.isNil(rootState)) { return {} }
  if (R.equals({}, rootState)) { return {} }
  return R.isNil(R.prop(id, rootState)) ? {} : R.prop(id, rootState)
})
