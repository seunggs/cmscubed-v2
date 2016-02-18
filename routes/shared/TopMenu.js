import React from 'react'
import R from 'ramda'
import OnOff from './OnOff'
import {createStateIds} from '../../modules/core/state'
import {ENV_ID, LOCALE_ID} from '../../modules/constants/global-states'
import LocaleSelection from './LocaleSelection'

const TopMenu = ({rootState}) => {
  return (
    <div className="bg-midnight white flex flex-center flex-justify p2">
      <OnOff id={ENV_ID} onText="Prod" offText="Staging" rootState={rootState} />
      <LocaleSelection id={LOCALE_ID} rootState={rootState} />
    </div>
  )
}

TopMenu.propTypes = {
  rootState: React.PropTypes.object.isRequired
}

export default TopMenu
