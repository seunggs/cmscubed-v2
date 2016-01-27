import React from 'react'
import {render} from 'react-dom'
import {Router, Route, IndexRoute, Link} from 'react-router'
import './assets/styles/main.css'
import App from './routes/App'
import {content$} from './utils/cmscubed/'

let previewUrl = 'https://www.terapeak.com/'

content$.subscribe(rootContent => {
  const createElement = (Component, props) => {
    props.rootContent = rootContent
    props.previewUrl = previewUrl
    return <Component {...props} />
  }

  render((
    <Router createElement={createElement}>
      <Route path="/" component={App}>
      </Route>
    </Router>
  ), document.getElementById('app'))
})
