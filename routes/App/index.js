import React from 'react'
import RouteTransition from 'RouteTransition'

const App = ({children, location}) => {
  return (
    <div>
      <RouteTransition pathname={location.pathname}>
        {children}
      </RouteTransition>
    </div>
  )
}

export default App
