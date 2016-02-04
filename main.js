import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute, Redirect, Link, browserHistory} from 'react-router'
import './assets/styles/main.css'
import Rx from 'rx-lite'
import R from 'ramda'
import Auth0Lock from 'auth0-lock'
import {setIdToken, getIdToken, requireAuth} from './modules/auth/'

import {content$} from './modules/observables/content'
import {states$} from './modules/observables/states'
import {isContent} from './modules/cmscubed/core'

import App from './routes/App/'
import Login from './routes/App/Login/'
import LoggedIn from './routes/App/LoggedIn/'
import Register from './routes/App/Register/'
import Main from './routes/App/Main/'
import Edit from './routes/App/Main/Edit/'
import Setup from './routes/App/Main/Setup/'

const previewUrl = 'https://www.terapeak.com/'

// combine content$ and states$
const app$ = Rx.Observable.merge(
  content$
)

app$.subscribe(change => {
  const createElement = (Component, props) => {
    if (isContent(change)) {
      props.rootContent = change
    } else {
      props.rootState = change
    }
    props.previewUrl = previewUrl
    props.lock = new Auth0Lock('KWe4lMDVwFR9GPquF4yuZ327Xg2sXt1p', 'cmscubed.auth0.com');
    return <Component {...props} />
  }

  render((
    <Router createElement={createElement} history={browserHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Login} />
        <Route path="loggedin" component={LoggedIn} /> {/* layover component to get userToken; redirects to main */}
        <Route path="register" component={Register} />
        <Route path="main" component={Main} onEnter={requireAuth}>
          <Route path="/setup" component={Setup} />
          <Route path="/edit/:page" component={Edit} />
        </Route>
      </Route>
    </Router>
  ), document.getElementById('app'))
})
