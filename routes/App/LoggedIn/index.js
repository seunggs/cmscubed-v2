import React from 'react'
import {browserHistory} from 'react-router'
import R from 'ramda'
import {getIdToken} from '../../../modules/auth/'
import {addUserProfile$$, getUserProject$$} from '../../../modules/observables/auth'
import PageLoading from '../../shared/PageLoading'

/*
  1) Get userToken, save it in localStorage if it doesn't already exist
  2) Use the token to retrieve profile and send it to the server to be saved in DB (if not there already)
  3) See if setup is already complete (i.e. already specified project and domain); if not, send to setup
*/

const LoggedIn = ({lock}) => {
  console.log('LoggedIn rendered')
  const idToken = getIdToken(lock)
  if (R.isNil(idToken)) { browserHistory.replace('/') }

  addUserProfile$$(lock, idToken)
    .flatMap(userObj => {
      // first save user email in local storage
      localStorage.setItem('userEmail', userObj.email)

      // then check if the user has completed the one-time setup
      return getUserProject$$(userObj.email)
    })
    .subscribe(projects => {
      if (!R.isNil(projects)) {
        browserHistory.replace('/dashboard')
      } else {
        browserHistory.replace('/setup')
      }
    }, err => {
      console.log('Something went wrong while running addUserProfile$ and checkSetupIsComplete$: ', err)
    })

  return (
    <div>
      <PageLoading />
    </div>
  )
}

export default LoggedIn
