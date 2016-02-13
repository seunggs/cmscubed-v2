import R from 'ramda'
import {getProjectDetailsAndEnvByDomain$$} from '../observables/project'

/* --- IMPURE --------------------------------------------------------------- */

export const getEnvFromLocalStorage = R.curry(() => {
  if (typeof(window) !== 'undefined') {
    return window.localStorage.getItem('env')
  }
  return
})

export const getDomain = R.curry(() => {
  if (typeof(window) !== 'undefined') {
    return window.location.protocol + '//' + window.location.host
  }
  return
})

export const getProjectFromLocalStorage = R.curry(() => {
  if (typeof(window) !== 'undefined') {
    return window.localStorage.getItem('projectName')
  }
  return
})
