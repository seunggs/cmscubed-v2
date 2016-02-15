import R from 'ramda'

/*
  STATE STRUCTURE = {
    global: {},
    ['/route-elemName-id']: {key: value},
    ...
  }
*/

// createStateIds :: Integer -> String -> [String]
export const createStateIds = R.curry((numOfElems, stateName) => {
  return R.range(0, numOfElems).map(num => stateName + '-' + num)
})

// getElemState :: String -> {*} -> {*}
export const getElemState = R.curry((id, rootState) => {
  if (R.isNil(rootState)) { return {} }
  if (R.equals({}, rootState)) { return {} }
  return R.isNil(R.prop(id, rootState)) ? {} : R.prop(id, rootState)
})
