import Rx from 'rx-lite'
import socket from '../websockets/'
import R from 'ramda'

/*
  STRATEGY:
  - Get each websocket event from the server and turn them into observables (i.e. 'routeContent:*' event)
  - Merge the content sent from DB with existing routeContent
  - Re-render react-router on onNext()
  - Handle any errors from server/DB
*/

export const initRouteContent$$ = (project, route) => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      socket.emit('routeContent:get', {project, route})
      socket.on('routeContent:fromDB', content => {
        observer.onNext(content)
      })
    }
    return () => {
      cancelled = true
      console.log('initRouteContent$ disposed')
    }
  })
}

export const routeContentFromDB$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    socket.on('routeContent:fromDB', content => {
      console.log('Route content obj received from server through websockets', content)
      observer.onNext(content)
    })
  }
  return () => {
    // socket.disconnect()
    cancelled = true
    console.log('routeContentFromDB$ disposed')
  }
}).scan(R.merge)

export const content$ = Rx.Observable.merge(
  routeContentFromDB$
)
