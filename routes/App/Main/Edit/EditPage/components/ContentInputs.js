import React from 'react'
import R from 'ramda'
import Editor from 'Editor'
import {convertPageContentToContentFields, convertFieldKeyToTitleCase} from 'core/content'

const ContentInputs = React.createClass({
  renderFields() {
    const {projectRoute, pageContent} = this.props
    console.log('projectRoute: ', projectRoute)
    console.log('pageContent: ', pageContent)
    const contentFieldObj = convertPageContentToContentFields(pageContent)
    const contentFieldKeys = R.keys(contentFieldObj)

    return contentFieldKeys.map((field, index) => {
      const labelText = convertFieldKeyToTitleCase(field)
      const fieldId = projectRoute + '-' + field
      return <Editor id={fieldId} key={index} labelText={labelText} text={contentFieldObj[field]} />
    })
  },
  render() {
    console.log('ContentInputs rendered')
    return (
      <div className="p2">
        {this.renderFields()}
      </div>
    )
  }
})

export default ContentInputs
