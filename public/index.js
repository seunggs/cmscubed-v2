import React, {Component} from 'react'

class Public extends Component {
  render () {
    return (
      <div className="container">
        {/*<PublicNav />*/}
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

export default Public
