import React from 'react'
import {loggedIn} from '../../../modules/auth/'

export default ({lock, history}) => {
  if (loggedIn()) {
    history.replace('/main')
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
