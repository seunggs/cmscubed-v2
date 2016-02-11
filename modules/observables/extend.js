import Rx from 'rx-lite'
import socket from '../websockets/'

Rx.Observable.prototype.fromSocketIo = eventName => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      socket.on(eventName, data => {
        observer.onNext(data)
      })
    }
    return () => {
      cancelled = true
      console.log('Disposed')
    }
  })
}
