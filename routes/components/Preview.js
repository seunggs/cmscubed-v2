import React from 'react'

const Preview = ({previewUrl}) => {
  const iframeStr = '<iframe src="' + previewUrl + '" class="preview"></iframe>'

  return (
    <div className="col col-9">
      <div dangerouslySetInnerHTML={{__html: iframeStr}}></div>
    </div>
  )
}

export default Preview
