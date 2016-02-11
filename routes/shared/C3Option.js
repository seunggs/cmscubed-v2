import React from 'react'

const C3Option = ({value}) => {
  return (
    <div className="c3-option" data-value={value}>
      {value}
    </div>
  )
}

C3Option.propTypes = {
  value: React.PropTypes.string.isRequired
}

export default C3Option
