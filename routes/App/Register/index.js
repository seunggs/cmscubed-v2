import React from 'react'
import {loggedIn} from '../../../modules/auth/'

const Register = ({lock}) => {
  if (loggedIn()) {
    history.replace('/main')
  } else {
    const lockOptions = {
      callbackURL: 'http://localhost:3333/loggedin',
      responseType: 'token',
      gravatar: false,
      closable: false
    }
    lock.showSignup(lockOptions, () => console.log('lock opened'))
  }

  return <div></div>
}

export default Register
