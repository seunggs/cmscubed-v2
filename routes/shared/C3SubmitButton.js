import React from 'react'
import R from 'ramda'
import {sendStateChangeEvent} from '../../modules/events/state'
import C3Error from './C3Error'

const C3SubmitButton = React.createClass({
  shouldComponentUpdate(nextProps) {
    return !R.equals(nextProps.elemState, this.props.elemState)
  },
  // getButtonTextElem :: String -> React Element
  getButtonTextElem(children, buttonState) {
    switch (buttonState) {
      case 'default':
        return <span>{children}</span>
      case 'loading':
        return (
          <span className="relative">
            <img className="absolute top-0" style={{left: -4+'px'}} src="../../assets/images/icons/button-loading.svg" />
            <span style={{marginLeft: 20+'px'}}>Please wait...</span>
          </span>
        )
      case 'success':
        return <span>'Success!'</span>
      case 'error':
        return <span>'Error'</span>
      default:
        return <span>{children}</span>
    }
  },
  processForm() {
    this.props.run()
  },
  handleClick(e) {
    e.preventDefault()

    const {children, id} = this.props
    const buttonState = 'loading'
    const disabled = 'true'
    sendStateChangeEvent(id, {buttonState, disabled})

    const checkFormIsValid = () => {
      const allFormElems = document.querySelectorAll('[data-form-elem="true"]')
      const validFormElems = document.querySelectorAll('[data-is-valid="true"]')
      return R.equals(R.length(allFormElems), R.length(validFormElems))
    }

    if (checkFormIsValid()) {
      this.processForm()
    } else {
      const buttonState = 'default'
      const disabled = 'false'
      const errorMsgs = ['Please complete the form completely']
      sendStateChangeEvent(id, {buttonState, errorMsgs, disabled})

      setTimeout(() => {
        const errorMsgs = []
        sendStateChangeEvent(id, {errorMsgs})
      }, 2500)
    }

    // sendStateChangeEvent(action)
  },
  render() {
    console.log('C3SubmitButton rendered')
    const {children, elemState, id} = this.props
    const {buttonState = 'default', errorMsgs = [], disabled = 'false'} = elemState

    const buttonTextElem = this.getButtonTextElem(children, buttonState)

    return (
      <div className="flex flex-center">
        <div className="flex-auto" />
        <C3Error errorMsgs={errorMsgs} />
        <div className="mr2" />
        <button className="btn btn-primary mt1"
                onClick={this.handleClick}
                data-disabled={disabled}>
          {buttonTextElem}
        </button>
      </div>
    )
  }
})

C3SubmitButton.propTypes = {
  elemState: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  run: React.PropTypes.func.isRequired
}

export default C3SubmitButton
