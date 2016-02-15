import R from 'ramda'
import {sanitizeDomain} from './core'

// TODO: what happens the user tries to push this to a non-registered domain?
// When I try to save to DB, I should check to see if the project domain exists first - if not, do nothing
export const getProjectDomain = (currentDomain) => {
  return sanitizeDomain(currentDomain)
}

// export const getEnv = (currentDomain) => {
//   if (typeof(window) !== 'undefined') {
//     const {subdomain} = parseDomain(currentDomain)
//     if (subdomain.indexOf('preview') !== -1 && subdomain.indexOf('prod') !== -1) {
//       return 'previewProd'
//     } else if (subdomain.indexOf('preview') !== -1 && subdomain.indexOf('staging') !== -1) {
//       return 'previewStaging'
//     } else if (subdomain.indexOf('preview') === -1 && subdomain.indexOf('staging') !== -1) {
//       return 'staging'
//     } else {
//       return 'prod'
//     }
//   }
//   return
// }

/* --- IMPURE --------------------------------------------------------------- */

export const getDomain = () => {
  if (typeof(window) !== 'undefined') {
    return window.location.protocol + '//' + window.location.host
  }
  return
}
