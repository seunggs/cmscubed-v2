import Rx from 'rx-lite'
import R from 'ramda'
import {ENV_ID, LOCALE_ID} from '../constants/global-states'
import {requestRouteContent} from '../websockets/'

/*
  STRATEGY:
  - Custom event ("state:change") is fired for each action
  - Triggers state$ observable which accumulates the state data
  - Re-render react-router on onNext()
  - Handle errors if any
  - NOTE: Each state is saved in the following form - {id: {}} where id = 'state-' + route + '-index'

  EXCEPTION - GLOBAL STATES:
  - If state is 1) env, or 2) locale, then send request for new content
*/

export const state$ = Rx.Observable.fromEvent(document, 'state:change')
  .map(e => e.detail)
  .distinctUntilChanged(R.equals)
  .map(state => {
    // handle global state exception
    const stateId = R.compose(R.head, R.keys)(state)
    if (stateId === ENV_ID || stateId === LOCALE_ID) {
      // set env or locale in localStorage for outside-of-React access
      if (stateId === ENV_ID) { window.localStorage.setItem('env', state[stateId].isOn ? 'prod' : 'staging') }
      if (stateId === LOCALE_ID) { window.localStorage.setItem('locale', state[stateId].locale ) }

      // if env or locale has changed, ask for new content
      const projectDomain = window.localStorage.getItem('projectDomain')
      const env = window.localStorage.getItem('env')
      const locale = window.localStorage.getItem('locale')
      const route = '/'
      console.log(projectDomain, env, locale, route)
      if (!R.isNil(projectDomain) && !R.isNil(env) && !R.isNil(locale)) {
        // send request for new content
        console.log('New content request sent due to change in: ', stateId)
        requestRouteContent({projectDomain, env, locale, route})
      }
    }
    return state
  })
  .scan(R.mergeWith(R.merge), {}) // Instead of simple R.merge to accommodate for multiple event handlers within the same id
