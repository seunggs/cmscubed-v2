import React from 'react'
import R from 'ramda'
import {getElemState} from '../../modules/core/state'
import {sendStateChangeEvent} from '../../modules/events/state'
import {Motion, spring} from 'react-motion'

const OnOff = React.createClass({
  getState() {
    const {id, rootState} = this.props
    return getElemState(id, rootState)
  },
  componentDidMount() {
    const {id} = this.props
    console.log('id: ', id)
    const isOn = false
    sendStateChangeEvent(id, {isOn})
  },
  clickHandler() {
    const {id} = this.props
    const {isOn} = this.getState()
    sendStateChangeEvent(id, {isOn: isOn ? false : true})
  },
  render() {
    const {buttonColor = '#fff', onColor = '#ac3520', offColor = '#0e9e2a', onText = 'On', offText = 'Off', width = 32, height = 16} = this.props
    const {isOn} = this.getState()
    const bgColor = isOn ? onColor : offColor
    const offTextColor = isOn ? {color: 'rgba(255,255,255,0.5)'} : {color: 'rgba(255,255,255,0.9)'}
    const onTextColor = isOn ? {color: 'rgba(255,255,255,0.9)'} : {color: 'rgba(255,255,255,0.5)'}
    const buttonSize = height
    const motionOption = {stiffness: 180, damping: 18}
    const style = isOn ? {x: spring(width-buttonSize, motionOption)} : {x: spring(0, motionOption)}

    return (
      <div className="flex flex-center" style={{cursor: 'pointer'}}>
        <div className="h6 caps mr1" style={offTextColor}>{offText}</div>
        <div className="relative"
             style={{
               backgroundColor: bgColor,
               borderRadius: 500+'px',
               width: width+'px',
               height: height+'px'
             }}
             onClick={this.clickHandler}>
          <Motion style={style}>
            {({x}) => <div className="absolute circle top-0 left-0" style={{width: buttonSize, height: buttonSize, backgroundColor: buttonColor, left: x}}></div>}
          </Motion>
        </div>
        <div className="h6 caps ml1" style={onTextColor}>{onText}</div>
      </div>
    )
  }
})

OnOff.propTypes = {
  onColor: React.PropTypes.string,
  offColor: React.PropTypes.string,
  onText: React.PropTypes.string,
  offText: React.PropTypes.string,
  width: React.PropTypes.string,
  height: React.PropTypes.string,
  id: React.PropTypes.string.isRequired,
  rootState: React.PropTypes.object.isRequired
}

export default OnOff
