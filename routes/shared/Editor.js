import React from 'react'
import R from 'ramda'
import socket from 'websockets/'
import MediumEditor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import {onBlur$$, sendContentField$$} from 'observables/ui'
import {sendStateChangeEvent} from 'events/state'
import {getElemState} from 'core/state'
import {checkIsInteger} from 'utils/'

const Editor = React.createClass({
  getState() {
    const {id, rootState} = this.props
    return getElemState(id, rootState)
  },
  checkIsEditorEmpty(editorElem) {
    return editorElem.innerHTML === '' || editorElem.innerHTML === '<p><br></p>'
  },
  shouldComponentUpdate(nextProps) {
    const {id} = this.props
    return !R.equals(getElemState(id, nextProps.rootState), this.getState())
  },
  componentDidMount() {
    const {id} = this.props
    const elemState = this.getState()
    const isEmpty = this.checkIsEditorEmpty(this._editorElem)
    const editorElem = this._editorElem.medium.elements[0]

    // Handle data-medium-empty attr outside of React (since it's a custom attribute onto react-medium-editor component)
    editorElem.setAttribute('data-medium-empty', isEmpty) // set initial attr
    onBlur$$(editorElem).subscribe(e => e.target.setAttribute('data-medium-empty', this.checkIsEditorEmpty(e.target))) // set on every blur

    // handle content field update websocket event to server
    const [projectRoute, keyPathStr] = id.split('-')
    sendContentField$$(editorElem).subscribe(fieldValue => {
      console.log('fieldObj sent! ', {projectRoute, keyPath: R.split('$', keyPathStr), value: fieldValue})
      socket.emit('contentField:update', {projectRoute, keyPath: R.split('$', keyPathStr), value: fieldValue})
    })
  },
  render() {
    const {id, labelText, text} = this.props
    const {isEmpty} = this.getState()

    // Handle array indenting and styling
    const arrayDepth = R.compose(R.length, R.filter(checkIsInteger), R.split('$'), R.last, R.split('-'))(id)

    return (
      <div className="input-group">
        <MediumEditor
          id={id}
          ref={ref => this._editorElem = ref}
          className="c3-field"
          style={{marginLeft: arrayDepth + 'rem'}}
          text={text}
          options={{placeholder: false, disableReturn: true}}
          data-medium-empty={isEmpty}
        />
        <label className="c3-editor-label" style={{marginLeft: arrayDepth + 'rem'}}>{labelText}</label>
      </div>
    )
  }
})

Editor.propTypes = {
  id: React.PropTypes.string.isRequired,
  labelText: React.PropTypes.string,
  text: React.PropTypes.string.isRequired
}

export default Editor
