import React from 'react'

const Content = ({src, display}) => {
  const style = {display} || {display: 'inline-block'}
  return (
    <span dangerouslySetInnerHTML={{__html: src}} style={style} />
  )
}

export default Content

Content.propTypes = {
  src: React.PropTypes.string.isRequired,
  display: React.PropTypes.string
}
