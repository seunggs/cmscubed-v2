import React from 'react'
import ContentInputs from './components/ContentInputs'
import Preview from './components/Preview'
import {getProjectRoute, getPageContent} from '../../../../../modules/core/content'

const EditPage = ({location, rootContent}) => {
  console.log('EditPage rendered')
  console.log('rootContent: ', rootContent)
  const projectRoute = getProjectRoute(location.pathname)
  const pageContent = getPageContent(projectRoute, rootContent)
  const projectUrl = 'http://www.terapeak.com'
  const previewUrl = projectUrl + projectRoute
  return (
    <div className="clearfix">
      <Preview previewUrl={previewUrl} />
      <ContentInputs projectRoute={projectRoute} pageContent={pageContent} />
    </div>
  )
}

export default EditPage
