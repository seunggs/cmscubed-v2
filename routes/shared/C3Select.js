import React from 'react'
import R from 'ramda'
import {sendStateChangeEvent} from '../../modules/events/state'
import {createOnClick$} from '../../modules/observables/ui'
import C3Error from './C3Error'

const C3Select = React.createClass({
  shouldComponentUpdate(nextProps) {
    return !R.equals(nextProps.elemState, this.props.elemState)
  },
  componentDidMount() {
    const {id} = this.props
    // handle focus state on document
    createOnClick$(document).subscribe(e => {
      if (this._selectElem !== e.target) {
        if (this._selectElem.getAttribute('data-c3-select-focused') === 'true') {
          const isFocused = false
          sendStateChangeEvent(id, {isFocused})
        }
      }
    })
  },
  handleClick(e) {
    const {id, elemState, validators} = this.props
    let {isFocused} = elemState
    const selectValueContainerElem = e.target.querySelector('.c3-option-selected')
    const selectValue = R.isNil(selectValueContainerElem) ? e.target.innerText : selectValueContainerElem.innerText

    const isEmpty = R.isEmpty(selectValue)
    isFocused = isFocused ? false : true
    const invalidValidators = validators.filter(validator => !validator.predicateFunc(selectValue))
    const errorMsgs = invalidValidators.map(invalid => invalid.errorMsg)
    const isValid = R.compose(R.equals(0), R.length)(invalidValidators)

    sendStateChangeEvent(id, {isEmpty, isFocused, selectValue, errorMsgs, isValid})
  },
  handleBlur(e) {
    const {id, validators} = this.props
    const selectValueContainerElem = e.target.querySelector('.c3-option-selected')
    const selectValue = R.isNil(selectValueContainerElem) ? e.target.innerText : selectValueContainerElem.innerText

    const invalidValidators = validators.filter(validator => !validator.predicateFunc(selectValue))
    const errorMsgs = invalidValidators.map(invalid => invalid.errorMsg)
    const isValid = R.compose(R.equals(0), R.length)(invalidValidators)
    const isTouched = true

    sendStateChangeEvent(id, {errorMsgs, isValid, isTouched})
  },
  render() {
    console.log('C3Select rendered')
    const {children, id, name, elemState, placeholder, selected} = this.props
    const {isEmpty = R.isNil(selected), isFocused = 'false', selectValue = selected, isTouched = 'false', isValid = 'null', errorMsgs = []} = elemState
    return (
      <div>
        <div className="input-group">
          <a className="c3-field c3-select col-12 relative z2"
             name={name}
             data-form-elem="true"
             onClick={this.handleClick}
             onBlur={this.handleBlur}
             data-c3-select-empty={isEmpty}
             data-c3-select-focused={isFocused}
             data-value={selectValue}
             data-is-touched={isTouched}
             data-is-valid={isValid}
             ref={ref => this._selectElem = ref}
             tabIndex="0">
            {/* caret icon */}
            <div className="c3-select-caret z1">
              <svg version="1.0" x="0px" y="0px" viewBox="0 0 90 90" enable-background="new 0 0 90 90">
                <g>
                  <path className="c3-select-caret-svg-path" d="M44.7,58.1L31,41.9c-0.8-0.9-0.7-2.3,0.2-3.1c0.9-0.8,2.3-0.7,3.1,0.2l10.4,12.3l10.4-12.3   c0.8-0.9,2.2-1,3.1-0.2c0.9,0.8,1,2.2,0.2,3.1L44.7,58.1z"/>
                  <path className="c3-select-caret-svg-path" d="M44.9,80c-19.3,0-35-15.8-35-35s15.8-35,35-35s35,15.8,35,35S64.2,80,44.9,80z M44.9,14.4   c-16.9,0-30.6,13.8-30.6,30.6s13.8,30.6,30.6,30.6S75.6,61.9,75.6,45S61.8,14.4,44.9,14.4z"/>
                </g>
              </svg>
            </div>
            {/* end: caret icon */}
            <div className="c3-option-selected">{selectValue}</div>
            <div className="c3-option-group col-12 z1">
              {children}
            </div>
          </a>
          <label className="c3-select-label z3">{placeholder}</label>
          <C3Error errorMsgs={errorMsgs} />
        </div>
      </div>
    )
  }
})

C3Select.propTypes = {
  id: React.PropTypes.string.isRequired,
  name: React.PropTypes.string.isRequired,
  elemState: React.PropTypes.object.isRequired,
  placeholder: React.PropTypes.string.isRequired,
  validators: React.PropTypes.array,
  selected: React.PropTypes.string
}

export default C3Select
