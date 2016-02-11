import React from 'react'
import {loggedIn} from '../../../modules/auth/'

const Login = ({lock, history, children}) => {
  if (loggedIn()) {
    history.replace('/loggedin')
  } else {
    const lockOptions = {
      callbackURL: 'http://127.0.0.1:3333/loggedin',
      responseType: 'token',
      gravatar: false,
      disableSignupAction: true,
      closable: false
    }
    lock.show(lockOptions)
  }

  return <div></div>
}

export default Login
