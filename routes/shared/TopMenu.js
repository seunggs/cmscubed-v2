import React from 'react'
import OnOff from './OnOff'
import {createUniqueStateIds} from '../../modules/core/state'

const TopMenu = ({location, rootState}) => {
  const ids = createUniqueStateIds(1, location.pathname)
  return (
    <div className="bg-midnight white flex flex-center flex-justify p2">
      <OnOff id={ids[0]} onText="Prod" offText="Staging" rootState={rootState} />
    </div>
  )
}

TopMenu.propTypes = {
  location: React.PropTypes.object.isRequired,
  rootState: React.PropTypes.object.isRequired
}

export default TopMenu
