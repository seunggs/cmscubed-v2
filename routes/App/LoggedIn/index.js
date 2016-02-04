import React from 'react'
import {getIdToken} from '../../../modules/auth/'
import {settings$} from '../../../modules/observables/auth'

export default ({lock, history}) => {
  console.log('LoggedIn rendered')
  const idToken = getIdToken(lock)

  settings$.subscribe(settings => {
    if (!settings) { // if setup is not complete
      history.replace('/setup')
    } else {
      history.replace('/edit')
    }
  })

  return (
    <div className="fixed top-0 right-0 bottom-0 left-0 flex flex-center">
      <img className="mx-auto" src="../../../assets/images/icons/loading.svg" />
    </div>
  )
}
