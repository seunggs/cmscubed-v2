import React from 'react'
import R from 'ramda'
import TopMenu from 'TopMenu'
import ContentInputs from './components/ContentInputs'
import Preview from './components/Preview'
import SideMenu from 'SideMenu'
import RouteTreeSideMenu from 'RouteTreeSideMenu'
import config from '../../../../../client-config'
import {getProjectRoute, getPageContent, getCurrentDomain, checkIsLocalEnv} from 'core/content'
import {createStateIds, getElemState} from 'core/state'
import {sendStateChangeEvent} from 'events/state'
import {checkSocketIoLoadedInPreview$$} from 'observables/ui'
import {requestRouteContent} from 'websockets/'

const EditPage = React.createClass({
  getId() {
    return R.head(createStateIds(1, 'EditPage'))
  },
  getState() {
    const {rootState} = this.props
    return getElemState(this.getId(), rootState)
  },
  getProjectUrl() {
    const isLocalEnv = checkIsLocalEnv(getCurrentDomain(global.location))
    const {localeMap} = JSON.parse(global.localStorage.getItem('projectDetails'))
    const locale = global.localStorage.getItem('locale')
    const env = global.localStorage.getItem('env')
    return isLocalEnv ? config.userLocalHost + ':' + config.userLocalPort : R.path([locale, env + 'Domain'], localeMap)
  },
  componentDidMount() {
    console.log('EditPage component did mount')
    // When preview is ready, send a request for routeContent to kick off fieldUpdates observables
    checkSocketIoLoadedInPreview$$(this.getProjectUrl())
      .subscribe(e => {
        if (!R.isNil(e)) {
          console.log('Preview is ready; request routeContent to kick off fieldUpdates')
          const projectDomain = window.localStorage.getItem('projectDomain')
          const env = window.localStorage.getItem('env')
          const locale = window.localStorage.getItem('locale')
          const route = '/'
          if (!R.isNil(projectDomain) && !R.isNil(env) && !R.isNil(locale)) {
            // send request for new content
            requestRouteContent({projectDomain, env, locale, route})
          }
        }
      })
  },
  render() {
    const {location, rootContent, rootState, params} = this.props
    console.log('EditPage rendered')
    const projectUrl = this.getProjectUrl()
    const projectRoute = getProjectRoute(params.page)
    const previewUrl =  projectUrl + projectRoute
    const pageContent = getPageContent(projectRoute, rootContent)
    const elemState = this.getState()

    return (
      <div>
        <TopMenu rootState={rootState} />
        <div className="relative flex">

          {/* default thin menu */}
          <SideMenu rootContent={rootContent} rootState={rootState} />
          {/* end: default thin menu */}

          {/* hidden routeTree menu */}
          <RouteTreeSideMenu rootContent={rootContent} rootState={rootState} />
          {/* end: hidden routeTree menu */}

          <div className="relative" style={{width: 100+'%', height: 100+'vh'}}>

            {/* preview */}
            <div className="absolute top-0 bottom-0 left-0"
                  style={{
                    width: 75+'%',
                    overflow: 'auto'
                  }}
            >
              <Preview projectUrl={projectUrl} previewUrl={previewUrl} />
            </div>
            {/* end: preview */}

            {/* content inputs */}
            <div className="absolute top-0 right-0 bottom-0 border-left"
                  style={{
                    width: 25+'%',
                    overflow: 'auto',
                    borderWidth: '2px'
                  }}
            >
              <ContentInputs projectRoute={projectRoute} pageContent={pageContent} />
            </div>
            {/* end: content inputs */}

          </div>
        </div>
      </div>
    )
  }
})

export default EditPage
