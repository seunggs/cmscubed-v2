import React from 'react'
import R from 'ramda'
import Rx from 'rx-lite'
import {sendStateChangeEvent} from 'events/state'
import {projectNameAvailable$} from 'observables/ui'
import {getElemState} from 'core/state'
import C3Error from 'C3Error'

const C3Input = React.createClass({
  getState() {
    const {id, rootState} = this.props
    return getElemState(id, rootState)
  },
  shouldComponentUpdate(nextProps) {
    const {id} = this.props
    return !R.equals(getElemState(id, nextProps.rootState), this.getState())
  },
  handleBlur(e) {
    const {id, validators, asyncValidator} = this.props
    const inputValue = e.target.value

    // start loading button
    const buttonLoading = true
    sendStateChangeEvent(id, {buttonLoading})

    const isTouched = true
    const invalidValidators = validators.filter(validator => !validator.predicateFunc(inputValue))

    // only check for async validators if sync validators are all valid
    if (invalidValidators.length > 0) {
      const errorMsgs = invalidValidators.map(invalid => invalid.errorMsg)
      const isValid = false
      const buttonLoading = false

      sendStateChangeEvent(id, {buttonLoading, errorMsgs, isValid, isTouched, inputValue})
    } else {
      // at this point, all the sync validators are valid
      if (R.isNil(asyncValidator)) {
        // no asyncValitor is specified
        const errorMsgs = []
        const isValid = true
        const buttonLoading = false

        sendStateChangeEvent(id, {buttonLoading, errorMsgs, isValid, isTouched, inputValue})
      } else {
        asyncValidator.predicateFunc(inputValue)
          .subscribe(asyncValid => {
            const isValid = asyncValid
            const errorMsgs = asyncValid ? [] : [asyncValidator.errorMsg]
            const buttonLoading = false

            sendStateChangeEvent(id, {buttonLoading, errorMsgs, isValid, asyncValid, isTouched, inputValue})
          })
      }
    }
  },
  render() {
    console.log('C3Input rendered')
    const {id, name, labelText, autoFocus, rootState, validators = []} = this.props
    const {errorMsgs = [], isValid = 'null', isTouched = 'false', inputValue, buttonLoading = 'false'} = this.getState()
    return (
      <div className="input-group">
        <input id={id}
               name={name}
               data-form-elem="true"
               type="text"
               className="c3-field block col-12"
               data-value={inputValue}
               onBlur={this.handleBlur}
               data-is-touched={isTouched}
               data-is-valid={isValid}
               autoFocus={autoFocus}
               required />
        {(() => {
          if (buttonLoading === true) {
            return <img className="c3-field-loading-icon" src="../assets/images/icons/loading.svg" />
          }
        })()}
        <label className="c3-label">{labelText}</label>
        <C3Error errorMsgs={errorMsgs} />
      </div>
    )
  }
})

C3Input.propTypes = {
  id: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  rootState: React.PropTypes.object.isRequired,
  labelText: React.PropTypes.string.isRequired,
  validators: React.PropTypes.array,
  asyncValidator: React.PropTypes.object,
  autoFocus: React.PropTypes.string
}

export default C3Input
