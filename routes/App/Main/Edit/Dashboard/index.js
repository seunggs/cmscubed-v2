import React from 'react'
import R from 'ramda'
import RouteTree from '../../../../shared/RouteTree'
import {createStateIds, getElemState} from '../../../../../modules/core/state'
import {sendStateChangeEvent} from '../../../../../modules/events/state'
import PageLoading from '../../../../shared/PageLoading'
import TopMenu from '../../../../shared/TopMenu'

const Dashboard = React.createClass({
  getId() {
    const {location} = this.props
    return R.head(createStateIds(1, location.pathname))
  },
  getState() {
    const {rootState} = this.props
    return getElemState(this.getId(), rootState)
  },
  shouldComponentUpdate(nextProps) {
    const neitherStateNorContentChanged = R.equals(nextProps.rootState, this.props.rootState) && R.equals(nextProps.rootContent, this.props.rootContent)
    return neitherStateNorContentChanged ? false : true
  },
  render() {
    console.log('Dashboard rendered')
    const {rootContent, rootState} = this.props
    const elemState = this.getState()
    console.log('rootState: ', rootState)
    console.log('rootContent: ', rootContent)

    return (
      <div>
        <TopMenu rootState={rootState} />
        <RouteTree rootContent={rootContent} />
        {(() => {if (elemState.pageLoading) { return <PageLoading /> }})()}
      </div>
    )
  }
})

export default Dashboard
