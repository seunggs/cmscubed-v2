import React from 'react'

const Preview = ({routeContent}) => {
  console.log('routeContent: ', routeContent)

  return (
    <div className="col col-3 bg-darken-1">
      <div className="p2">
        <textarea></textarea>
      </div>
    </div>
  )
}

export default Preview
