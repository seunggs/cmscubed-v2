import React from 'react'
import {browserHistory} from 'react-router'
import {loggedIn} from 'auth/'

const Register = ({lock}) => {
  if (loggedIn()) {
    browserHistory.replace('/loggedin')
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
