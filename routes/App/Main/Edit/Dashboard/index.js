import React from 'react'
import R from 'ramda'
import RouteTree from 'RouteTree'
import TopMenu from 'TopMenu'

const Dashboard = React.createClass({
  render() {
    console.log('Dashboard rendered')
    const {rootContent, rootState} = this.props

    return (
      <div className="bg-before-midnight" style={{height: '100vh'}}>
        <TopMenu rootState={rootState} />
        <div className="col col-3">
          <RouteTree rootContent={rootContent} />
        </div>
      </div>
    )
  }
})

export default Dashboard
