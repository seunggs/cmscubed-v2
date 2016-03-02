import React from 'react'
import R from 'ramda'
import {getElemState} from 'core/state'
import {sendStateChangeEvent} from 'events/state'

const LocaleSelection = React.createClass({
  getState() {
    const {id, rootState} = this.props
    return getElemState(id, rootState)
  },
  shouldComponentUpdate(nextProps) {
    const {id} = this.props
    return !R.equals(getElemState(id, nextProps.rootState), this.getState())
  },
  componentDidMount() {
    const {id} = this.props
    const projectDetails = JSON.parse(window.localStorage.getItem('projectDetails'))
    const locale = projectDetails.defaultLocale
    window.localStorage.setItem('locale', locale)
    sendStateChangeEvent(id, {locale})
  },
  render() {
    console.log('LocaleSelection rendered')
    const {rootState} = this.props
    const projectDetails = JSON.parse(window.localStorage.getItem('projectDetails'))
    const allAvailableLocales = R.keys(projectDetails.localeMap)
    const activeLocale = this.getState().locale
    return (
      <div className="flex flex-center">
        {allAvailableLocales.map((locale, index) => {
          const baseStyle = {fontSize: '0.75rem', padding: '0.2rem 0.5rem'}
          const activeStyle = locale === activeLocale ? {color: 'rgba(255,255,255,0.75)', borderColor: 'rgba(255,255,255,0.6)'} : {color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.3)'}
          const style = R.merge(baseStyle, activeStyle)
          return <button key={index} className="btn btn-outline-light pill ml2" style={style}>{locale}</button>
        })}
      </div>
    )
  }
})

LocaleSelection.propTypes = {
  id: React.PropTypes.string.isRequired,
  rootState: React.PropTypes.object.isRequired
}

export default LocaleSelection
