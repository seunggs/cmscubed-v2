import React from 'react'
import R from 'ramda'
import {Motion, spring, presets} from 'react-motion'

const C3Error = ({errorMsgs}) => {
  return (
    <div className="c3-error-group">
      {R.take(1, errorMsgs).map((errorMsg, index) => {
        return (
          <Motion key={index} defaultStyle={{opacity: 0, scale: 0.5}} style={{opacity: spring(1), scale: spring(1, presets.wobbly)}}>
            {({opacity, scale}) => <div className="c3-error" style={{opacity: opacity, transform: `scale(${scale})`, transformOrigin: 'top left'}}>* {errorMsg}</div>}
          </Motion>
        )
      })}
    </div>
  )
}

C3Error.propTypes = {
  errorMsgs: React.PropTypes.array.isRequired
}

export default C3Error
