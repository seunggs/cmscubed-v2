import React, {Component} from 'react'
import Preview from './components/Preview'
import ContentInputs from './components/ContentInputs'
import {getPageContent} from '../utils/cmscubed/'

const App = ({previewUrl, route, rootContent}) => {
  let content = getPageContent(route.path, rootContent)

  return (
    <div className="clearfix">
      <Preview previewUrl={previewUrl} />
      <ContentInputs routeContent={content}/>
    </div>
  )
}

export default App
