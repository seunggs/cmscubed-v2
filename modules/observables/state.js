import Rx from 'rx-lite'
import R from 'ramda'

/*
  STRATEGY:
  - Custom event ("state:change") is fired for each action
  - Triggers state$ observable which accumulates the state data
  - Re-render react-router on onNext()
  - Handle errors if any
  - NOTE: Each state is saved in the following form - {id: {}} where id = 'state-' + route + '-index'
*/

export const state$ = Rx.Observable.fromEvent(document, 'state:change')
  .map(e => e.detail)
  .distinctUntilChanged(R.equals)
  .scan(R.mergeWith(R.merge), {}) // Instead of simple R.merge to accommodate for multiple event handlers within the same id
