import socket from '../websockets/'

/* --- IMPURE --------------------------------------------------------------- */

// getIdToken :: {*} -> String
export const getIdToken = (lock) => {
  let idToken = window.localStorage.getItem('userToken')
  const authHash = lock.parseHash(window.location.hash)
  if (!idToken && authHash) {
    if (authHash.id_token) {
      idToken = authHash.id_token
      window.localStorage.setItem('userToken', authHash.id_token)
    }
    if (authHash.error) {
      console.log("Error signing in", authHash)
      return null
    }
  }
  return idToken
}

// loggedIn :: () -> Boolean
export const loggedIn = () => {
  const idToken = window.localStorage.getItem('userToken')
  return !idToken ? false : true
}

// requireAuth :: {*} -> ({*} -> IMPURE) -> IMPURE
export const requireAuth = (nextState, replace) => {
  console.log('nextState.location.pathname: ', nextState.location.pathname)
  if (!loggedIn()) {
    console.log('not logged in')
    replace({
      pathname: '/',
      state: { nextPathname: nextState.location.pathname }
    })
  }
}
