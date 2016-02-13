import React from 'react'

const C3HiddenInput = ({name, value}) => {
  return (
    <div name={name}
         data-value={value}
         data-form-elem="true"
         data-is-valid="true"
         style={{display: 'none'}} />
  )
}

C3HiddenInput.propTypes = {
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.string.isRequired
}

export default C3HiddenInput
