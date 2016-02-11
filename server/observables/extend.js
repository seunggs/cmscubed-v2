import Rx from 'rx-lite'
import {io} from '../../server'

Rx.Observable.prototype.fromSocketIo = eventName => {
  let cancelled = false
  if (!cancelled) {
    io.on('connection', socket => {
      socket.on(eventName, data => {
        observer.onNext(data)
      })
    })
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
}
