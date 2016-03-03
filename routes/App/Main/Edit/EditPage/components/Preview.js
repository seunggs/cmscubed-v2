import React from 'react'
import R from 'ramda'
import {sendCrossDomainEvent} from 'events/crossdomain'
import {checkPreviewIsReady$$} from 'observables/ui'

const Preview = React.createClass({
  shouldComponentUpdate() {
    return false
  },
  sendIsPreviewEvent() {
    const previewWindow = document.getElementById('preview').contentWindow
    sendCrossDomainEvent(previewWindow, 'isPreview', '*')
    console.log('sendCrossDomainEvent sent!')
  },
  componentDidMount() {
    const {projectUrl} = this.props
    // Receive preview page ready event from preview iframe and send a message back to confirm that it's preview
    checkPreviewIsReady$$(projectUrl).subscribe(e => {
      if (!R.isNil(e)) {
        this.sendIsPreviewEvent()
      }
    })
  },
  render() {
    console.log('Preview rendered!')
    const {previewUrl} = this.props
    const iframeStr = '<iframe id="preview" src="//' + previewUrl + '" class="preview"></iframe>'

    return (
      <div className="p2">
        <div dangerouslySetInnerHTML={{__html: iframeStr}} />
      </div>
    )
  }
})

export default Preview
