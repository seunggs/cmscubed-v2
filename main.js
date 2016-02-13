import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute, Redirect, Link, browserHistory, RouterContext} from 'react-router'
import './assets/styles/main.css'
import Rx from 'rx-lite'
import R from 'ramda'
import Auth0Lock from 'auth0-lock'
import {setIdToken, getIdToken, requireAuth} from './modules/auth/'
import socket from './modules/websockets/'

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
import Dashboard from './routes/App/Main/Dashboard/'

// combine content$ and states$
const app$ = Rx.Observable.combineLatest(content$, state$)

const routes = (
  <Route path="/" component={App}>
    <IndexRoute component={Login} />
    <Route path="loggedin" component={LoggedIn} /> {/* layover component to get userToken; redirects to main/* */}
    <Route path="register" component={Register} />
    <Route path="main" component={Main} onEnter={requireAuth}>
      <Route path="/setup" component={Setup} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/edit/:page" component={Edit} />
    </Route>
  </Route>
)

app$.subscribe(change => {
  // TODO: createElement runs three times - why??
  const createElement = (Component, props) => {
    const rootContent = change[0]
    const rootState = change[1]
    console.log('content changed! ', rootContent)
    console.log('state changed! ', rootState)
    const lock = new Auth0Lock('KWe4lMDVwFR9GPquF4yuZ327Xg2sXt1p', 'cmscubed.auth0.com')
    return <Component {...props} rootContent={rootContent} rootState={rootState} lock={lock} />
  }
  render((
    <Router routes={routes} createElement={createElement} history={browserHistory} />
  ), document.getElementById('app'))
})

// initialize state
sendStateChangeEvent('global', {})

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
