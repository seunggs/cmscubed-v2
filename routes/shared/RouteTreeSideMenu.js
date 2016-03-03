import React from 'react'
import R from 'ramda'
import {Motion, spring} from 'react-motion'
import {ROUTETREESIDEMENU_ID} from 'constants/global-states'
import {getElemState} from 'core/state'
import RouteTree from 'RouteTree'

const RouteTreeSideMenu = React.createClass({
  getState() {
    const {rootState} = this.props
    return getElemState(ROUTETREESIDEMENU_ID, rootState)
  },
  shouldComponentUpdate(nextProps) {
    return !R.equals(getElemState(ROUTETREESIDEMENU_ID, nextProps.rootState), this.getState())
  },
  render() {
    const {rootContent} = this.props
    const initialStyle = {x: spring(-280)}
    const finalStyle = {x: spring(0)}
    const elemState = this.getState()
    const style = elemState.visible ? finalStyle : initialStyle
    return (
      <Motion style={style}>
        {({x}) => (
          <div className="absolute top-0 bottom-0 z1 routeTreeWrapper" style={{width: 280+'px', transform: 'translateX('+x+'px)'}}>
            <RouteTree rootContent={rootContent} />
          </div>
        )}
      </Motion>
    )
  }
})

RouteTreeSideMenu.propTypes = {
  rootContent: React.PropTypes.object.isRequired,
  rootState: React.PropTypes.object.isRequired
}

export default RouteTreeSideMenu
