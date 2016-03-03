import React from 'react'
import R from 'ramda'
import {Link} from 'react-router'
import {createRouteTree} from '../../modules/core/content'

const RouteTree = React.createClass({
  renderRouteTree(routeTree) {
    const sign = route => {
      if (R.isEmpty(route.childRoutes)) {
        return <span style={{width:'16px'}}></span>
      } else {
        return (
          <svg style={{width:'16px', height:'16px'}} width="48" height="48" viewBox="0 0 48 48">
            <path stroke="#6f7175" fill="#6f7175" strokeWidth="3" strokeLinecap="round" d="M17.17 32.92l9.17-9.17-9.17-9.17 2.83-2.83 12 12-12 12z"/>
          </svg>
        )
      }
    }
    const shallowRenderRouteTree = routeTree => {
      return routeTree.map((route, index) => {
        // Replace deep route slashes with double $
        const routeTo = route.route === '/' ? '/edit/$root' : '/edit/' + R.compose(R.replace(/\//g, '$$$'), R.tail)(route.route)
        return (
          <div key={index}>
            <Link to={routeTo} className="routeTreeItem relative flex flex-center" style={{paddingLeft: '1rem', paddingRight: '2rem'}}>
              {sign(route)}<span style={{marginLeft:'2px'}}>{route.path}</span>
              <div className="routeTreeItemOverlay absolute flex flex-center">
                <div className="flex-auto"></div>
                {/*add icon*/}
                <button className="btn routeTreeItemOverlayIcon ocean">+</button>
                {/*end: add icon*/}
              </div>
            </Link>
            <div className="ml2">{shallowRenderRouteTree(route.childRoutes)}</div>
          </div>
        )
      })
    }
    return shallowRenderRouteTree(routeTree)
  },
  shouldComponentUpdate(nextProps) {
    return !R.equals(nextProps.rootContent, this.props.rootContent)
  },
  render() {
    const {rootContent} = this.props
    const routeTree = createRouteTree(rootContent)
    console.log('rootContent: ', rootContent)
    console.log('routeTree: ', routeTree)
    return (
      <div className="bg-right-before-midnight white py2" style={{width: 100+'%', height: 100+'vh'}}>
        {this.renderRouteTree(routeTree)}
      </div>
    )
  }
})

RouteTree.propTypes = {
  rootContent: React.PropTypes.object.isRequired
}

export default RouteTree
