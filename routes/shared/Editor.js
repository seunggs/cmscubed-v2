import React from 'react'
import socket from '../../modules/websockets/'
import MediumEditor from 'react-medium-editor'
import 'medium-editor/dist/css/medium-editor.css'
import 'medium-editor/dist/css/themes/default.css'
import {createOnBlur$, createContentFieldFromEditor$} from '../../modules/observables/ui'

const Editor = React.createClass({
  componentDidMount() {
    const {id, labelText, text} = this.props
    const thisElem = document.getElementById(id)
    const editorIsEmpty = () => thisElem.innerHTML === '' || thisElem.innerHTML === '<p><br></p>'
    const setEditorEmptyAttr = () => {
      if (editorIsEmpty()) {
        thisElem.setAttribute('data-medium-empty', 'true')
      } else {
        thisElem.setAttribute('data-medium-empty', 'false')
      }
    }
    setEditorEmptyAttr()
    const [projectRoute, field] = id.split('-')

    // handle blur event - set attr when empty so styling can be applied
    createOnBlur$(thisElem).subscribe(e => { setEditorEmptyAttr() })

    // handle content field update websocket event to server
    createContentFieldFromEditor$(thisElem).subscribe(fieldContent => {
      const pageContentField = [projectRoute, field, fieldContent]
      console.log('pageContentField: ', pageContentField)
      socket.emit('pageContentField:update', pageContentField)
    })
  },
  render() {
    const {id, labelText, text} = this.props
    return (
      <div className="input-group">
        <MediumEditor id={id} className="c3-field" text={text} options={{placeholder: false}} />
        <label className="c3-editor-label">{labelText}</label>
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
