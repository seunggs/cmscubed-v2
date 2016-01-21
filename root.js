import React from 'react'
import {render} from 'react-dom'
import {Router} from 'react-router'

import './assets/styles/main.css'

import Public from './public'
import Home from './public/containers/Home'

const rootRoute = {
  component: 'div',
  childRoutes: [
    {
      path: '/',
      indexRoute: { component: Home },
      component: Public,
      childRoutes: [
        require('./app')
      ]
    }
  ]
}

render(<Router routes={rootRoute} />, document.getElementById('app'))
