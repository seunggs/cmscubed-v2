import React from 'react'
import R from 'ramda'
import RouteTree from '../../../shared/RouteTree'
import {createStateIds, getElemState} from '../../../../modules/core/state'
import {sendStateChangeEvent} from '../../../../modules/events/state'
import {initRouteContent$$} from '../../../../modules/observables/content'
import {getUserProject$$} from '../../../../modules/observables/auth'
import PageLoading from '../../../shared/PageLoading'
import TopMenu from '../../../shared/TopMenu'

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
  componentDidMount() {
    const {rootState} = this.props
    const id = this.getId()

    const pageLoading = true
    sendStateChangeEvent(id, {pageLoading})

    const userEmail = localStorage.getItem('userEmail')
    getUserProject$$(userEmail)
      .flatMap(project => {
        return initRouteContent$$(project, '/')
      })
      .subscribe(() => {
        const pageLoading = false
        sendStateChangeEvent(id, {pageLoading})
      })
  },
  render() {
    const {rootContent, rootState} = this.props
    console.log('this.props: ', this.props)
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
