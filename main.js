import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute, Redirect, Link, browserHistory, RouterContext} from 'react-router'
import './assets/styles/main.css'
import Rx from 'rx-lite'
import R from 'ramda'
import Auth0Lock from 'auth0-lock'
import {setIdToken, getIdToken, requireAuth} from './modules/auth/'

import {content$} from './modules/observables/content'
import {state$} from './modules/observables/state'
import {isContent} from './modules/core/content'
import {sendStateChangeEvent} from './modules/events/state'

import App from './routes/App/'
import Login from './routes/App/Login/'
import LoggedIn from './routes/App/LoggedIn/'
import Register from './routes/App/Register/'
import Main from './routes/App/Main/'
import Edit from './routes/App/Main/Edit/'
import Setup from './routes/App/Main/Setup/'

const previewUrl = 'https://www.terapeak.com/'

// combine content$ and states$
const app$ = Rx.Observable.merge(content$, state$)

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Login} />
    <Route path="loggedin" component={LoggedIn} /> {/* layover component to get userToken; redirects to main/* */}
    <Route path="register" component={Register} />
    <Route path="main" component={Main} onEnter={requireAuth}>
      <Route path="/setup" component={Setup} />
      <Route path="/edit/:page" component={Edit} />
    </Route>
  </Route>
)

app$.subscribe(change => {
  // TODO: createElement runs three times - why??
  const createElement = (Component, props) => {
    if (isContent(change)) {
      props.rootContent = change
      console.log('content changed! ', props.rootContent)
    } else {
      props.rootState = change
      console.log('state changed! ', props.rootState)
    }
    // props.previewUrl = previewUrl
    props.lock = new Auth0Lock('KWe4lMDVwFR9GPquF4yuZ327Xg2sXt1p', 'cmscubed.auth0.com')
    return <Component {...props} />
  }
  render((
    <Router routes={routes} createElement={createElement} history={browserHistory} />
  ), document.getElementById('app'))
})

// CustomEvents polyfill for IE
(function () {
  if ( typeof window.CustomEvent === "function" ) return false;
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();
