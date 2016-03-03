import React from 'react'
import {ROUTETREESIDEMENU_ID} from 'constants/global-states'
import {getElemState} from 'core/state'
import {sendStateChangeEvent} from 'events/state'

const SideMenu = React.createClass({
  getState() {
    const {rootState} = this.props
    return getElemState(ROUTETREESIDEMENU_ID, rootState)
  },
  handleClick(e) {
    const elemState = this.getState()
    console.log('elemState.visible: ', elemState)
    const visible = elemState.visible ? false : true
    sendStateChangeEvent(ROUTETREESIDEMENU_ID, {visible})
  },
  render() {
    const {rootState, rootContent} = this.props
    return (
      <div className="bg-midnight p2 z2" style={{height: 100+'vh'}}>
        <a style={{cursor: 'pointer'}} onClick={this.handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <g stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" fill="none">
              <path d="M23.5 10.5h-8v-10h5l3 3zM20.5.5v3h3"/>
              <path d="M23.5 23.5h-8v-10h5l3 3zM20.5 13.5v3h3M5.5.5v1M5.5 6.5v1M5.5 3.5v1h1M5.5 9.5v1M5.5 12.5v1M5.5 15.5v1M5.5 18.5v1h1M8.5 4.5h1M11.5 4.5h1M14.5 4.5h1M8.5 19.5h1M11.5 19.5h1M14.5 19.5h1"/>
            </g>
          </svg>
        </a>
      </div>
    )
  }
})

SideMenu.propTypes = {
  rootState: React.PropTypes.object.isRequired,
  rootContent: React.PropTypes.object.isRequired
}

export default SideMenu
