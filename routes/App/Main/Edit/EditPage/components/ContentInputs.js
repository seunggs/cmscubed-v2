import React from 'react'
import R from 'ramda'
import Editor from '../../../../../shared/Editor'
import {convertCamelCaseToTitleCase} from '../../../../../../modules/utils/'

const ContentInputs = React.createClass({
  render() {
    const {projectRoute, pageContent} = this.props
    console.log('projectRoute: ', projectRoute)
    console.log('pageContent: ', pageContent)
    const fields = R.keys(pageContent)

    return (
      <div className="col col-3">
        <div className="p2">
          {fields.map((field, index) => {
            const labelText = convertCamelCaseToTitleCase(field)
            const fieldId = projectRoute + '-' + field
            return <Editor id={fieldId} key={index} labelText={labelText} text={pageContent[field]} />
          })}
        </div>
      </div>
    )
  }
})

export default ContentInputs
