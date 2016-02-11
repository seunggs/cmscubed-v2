import React from 'react'
import R from 'ramda'
import {getIdToken} from '../../../modules/auth/'
import {createAddUserProfile$, createSetupComplete$} from '../../../modules/observables/auth'
import PageLoading from '../../shared/PageLoading'

/*
  1) Get userToken, save it in localStorage if it doesn't already exist
  2) Use the token to retrieve profile and send it to the server to be saved in DB (if not there already)
  3) See if setup is already complete (i.e. already specified project and domain); if not, send to setup
*/

const LoggedIn = React.createClass({
  contextTypes: {
    router: React.PropTypes.object.isRequired
  },
  render() {
    console.log('LoggedIn rendered')
    const {lock} = this.props
    const {router} = this.context
    console.log('router: ', this.context)
    const idToken = getIdToken(lock)
    if (R.isNil(idToken)) { router.replace('/') }

    createAddUserProfile$(lock, idToken).subscribe(userObj => {
      createSetupComplete$(userObj.email).subscribe(setupComplete => {
        console.log('setup complete', setupComplete)
        if (setupComplete) {
          router.push('/edit')
        } else {
          router.push('/setup')
        }
      })
    }, err => {
      console.log('Something went wrong while running addUserProfile$: ', err)
    })

    return (
      <div>
        <PageLoading />
      </div>
    )
  }
})

export default LoggedIn
