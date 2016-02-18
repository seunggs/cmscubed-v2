import R from 'ramda'
import {sendStateChangeEvent} from '../events/state'
import {ENV_ID, LOCALE_ID} from '../constants/global-states'
import {getProjectDetailsByProjectDomain$$} from '../observables/project'

/*
  STATE STRUCTURE = {
    '/route-elemName-id': {key: value},
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

/* --- IMPURE --------------------------------------------------------------- */

// setProjectDetails
export const setProjectDetails = (nextState, replace, callback) => {
  // set projectDetails if it's not set already
  if (R.isNil(window.localStorage.getItem('projectDetails'))) {
    const projectDomain = localStorage.getItem('projectDomain')
    getProjectDetailsByProjectDomain$$(projectDomain)
      .subscribe(projectDetails => {
        console.log(projectDetails)
        // send back to setup if the user doesn't have projectDetails yet
        if (R.isNil(projectDetails)) {
          replace({
            pathname: '/setup',
            state: { nextPathname: nextState.location.pathname }
          })
        }
        window.localStorage.setItem('projectDetails', JSON.stringify(projectDetails))
        callback()
      }, err => {
        console.log('Something went wrong getting projectDetails in setProjectDetails(): ', err)
        callback()
        // TODO:
        // send to 404
      })
  }
  callback()
}
