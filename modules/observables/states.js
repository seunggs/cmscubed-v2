import Rx from 'rx-lite'

/*
  STRATEGY:
  - Get events from the user and turn them into observables
  - Merge the observables from all states
  - Re-render react-router on onNext()
  - Handle errors if any
*/

export const states$ = Rx.Observable.combineLatest()
