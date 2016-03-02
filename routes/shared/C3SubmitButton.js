import React from 'react'
import {browserHistory} from 'react-router'
import R from 'ramda'
import {sendStateChangeEvent} from 'events/state'
import {getElemState} from 'core/state'
import C3Error from 'C3Error'

const C3SubmitButton = React.createClass({
  getState() {
    const {id, rootState} = this.props
    return getElemState(id, rootState)
  },
  shouldComponentUpdate(nextProps) {
    const {id} = this.props
    return !R.equals(getElemState(id, nextProps.rootState), this.getState())
  },
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
        return (
          <span className="relative">
            <img className="absolute top-0" style={{left: -4+'px'}} src="../../assets/images/icons/check-circle-white.svg" />
            <span style={{marginLeft: 20+'px'}}>Success!</span>
          </span>
        )
      case 'error':
      return (
        <span className="relative">
          <img className="absolute top-0" style={{left: -4+'px'}} src="../../assets/images/icons/alert-white.svg" />
          <span style={{marginLeft: 20+'px'}}>Error</span>
        </span>
      )
      default:
        return <span>{children}</span>
    }
  },
  getFormElem() {
    // TODO: Find form element
    return document
  },
  checkFormIsValid() {
    const formElem = this.getFormElem()
    const allFormElems = formElem.querySelectorAll('[data-form-elem="true"]')
    const validFormElems = formElem.querySelectorAll('[data-is-valid="true"]')
    return R.equals(R.length(allFormElems), R.length(validFormElems))
  },
  getFormValues() {
    const formElem = this.getFormElem()
    const formElemNodeList = formElem.querySelectorAll('[data-form-elem="true"]')
    const formElemArray = [...formElemNodeList] // converts nodeList to Array
    return formElemArray.reduce((prev, elem) => {
      const key = elem.getAttribute('name')
      const value = elem.getAttribute('data-value')
      return R.merge({[key]: value}, prev)
    }, {})
  },
  submitForm() {
    const {id, createSubmitForm$, nextRoute} = this.props
    console.log('form values: ', this.getFormValues())
    createSubmitForm$(this.getFormValues()).subscribe(data => {
      console.log('Form submit return data: ', data)
      const buttonState = 'success'
      sendStateChangeEvent(id, {buttonState})

      setTimeout(() => {
        const buttonState = 'default'
        const disabled = 'false'
        sendStateChangeEvent(id, {buttonState, disabled})
        if (!R.isNil(nextRoute)) { browserHistory.replace(nextRoute) }
      }, 2500)
    }, (err) => {
      const buttonState = 'error'
      const errorMsgs = ['Something went wrong - please try again or contact support.']
      sendStateChangeEvent(id, {buttonState, errorMsgs})

      setTimeout(() => {
        const buttonState = 'default'
        const disabled = 'false'
        const errorMsgs = []
        sendStateChangeEvent(id, {buttonState, disabled, errorMsgs})
      }, 2500)
    })
  },
  handleClick(e) {
    e.preventDefault()

    const {children, id} = this.props
    const buttonState = 'loading'
    const disabled = 'true'
    sendStateChangeEvent(id, {buttonState, disabled})

    if (this.checkFormIsValid()) {
      this.submitForm()
    } else {
      const buttonState = 'default'
      const disabled = 'false'
      const errorMsgs = ['Please complete the form completely']
      sendStateChangeEvent(id, {buttonState, disabled, errorMsgs})

      setTimeout(() => {
        const errorMsgs = []
        sendStateChangeEvent(id, {errorMsgs})
      }, 2500)
    }
  },
  render() {
    console.log('C3SubmitButton rendered')
    const {children, rootState, id} = this.props
    const {buttonState = 'default', errorMsgs = [], disabled = 'false'} = this.getState()

    const buttonTextElem = this.getButtonTextElem(children, buttonState)

    return (
      <div className="flex flex-center">
        <div className="flex-auto" />
        <C3Error errorMsgs={errorMsgs} />
        <div className="mr3" />
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
  rootState: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  nextRoute: React.PropTypes.string,
  createSubmitForm$: React.PropTypes.func.isRequired
}

export default C3SubmitButton
