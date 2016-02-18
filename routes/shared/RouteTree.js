import React from 'react'
import {createRouteTree} from '../../modules/core/content'

const RouteTree = ({rootContent}) => {
  const routeTree = createRouteTree(rootContent)
  return (
    <div className="col col-12 bg-before-midnight white p2" style={{height: 100+'vh'}}>
      Route
    </div>
  )
}

export default RouteTree
