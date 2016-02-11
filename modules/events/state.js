import R from 'ramda'
import getElemState from '../core/state'

export const sendStateChangeEvent = (id, newState) => {
  const isValidId = !R.isNil(id)
  if (!isValidId) { throw Error('Please input a valid id for state change event') }

  const eventData = {[id]: newState}
  const changeStateEvent = new CustomEvent('state:change', {detail: eventData})
  document.dispatchEvent(changeStateEvent)
}
