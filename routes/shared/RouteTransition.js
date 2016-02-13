import React from 'react'
import {spring, TransitionMotion} from 'react-motion'
import R from 'ramda'

const RouteTransition = ({children, pathname}) => {
  const keyedChildren = React.cloneElement(children, {key: pathname})
  const childrenArray = R.isArrayLike(keyedChildren) ? keyedChildren : R.of(keyedChildren)
  const willEnter = () => ({opacity: 0})
  const getDefaultStyles = childrenArray => {
    return childrenArray.map(child => {
      return {key: child.key, style: {opacity: 0}}
    })
  }
  const getStyles = childrenArray => {
    return childrenArray.map(child => {
      return {key: child.key, style: {opacity: spring(1, {stiffness: 100, damping: 15})}}
    })
  }

  return (
    <TransitionMotion
      willEnter={willEnter}
      defaultStyles={getDefaultStyles(childrenArray)}
      styles={getStyles(childrenArray)}
    >
      {interpolatedStyles =>
        <div>
          {interpolatedStyles.map(config => {
            return (
              <div key={config.key} style={{opacity: config.style.opacity}}>
                {children}
              </div>
            )
          })}
        </div>
      }
    </TransitionMotion>
  )
}

RouteTransition.propTypes = {
  pathname: React.PropTypes.string.isRequired
}

export default RouteTransition
