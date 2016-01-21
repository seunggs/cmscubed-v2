import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, Link} from 'react-router'

import '../assets/styles/main.css'

import App from './containers/App'

ReactDOM.render((
  <Router>
    <Route path="/" component={App}></Route>
  </Router>
), document.getElementById('app'))
