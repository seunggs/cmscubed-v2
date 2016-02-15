import React from 'react'
import OnOff from './OnOff'
import {createStateIds} from '../../modules/core/state'

const TopMenu = ({rootState}) => {
  const ids = createStateIds(1, 'envSwitch')
  return (
    <div className="bg-midnight white flex flex-center flex-justify p2">
      <OnOff id={ids[0]} onText="Prod" offText="Staging" rootState={rootState} />
    </div>
  )
}

TopMenu.propTypes = {
  rootState: React.PropTypes.object.isRequired
}

export default TopMenu
