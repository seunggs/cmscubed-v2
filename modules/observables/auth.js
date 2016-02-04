import Rx from 'rx-lite'
import socket from '../websockets/'

export const settings$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    socket.on('settings:fromDB', settings => {
      console.log('Settings obj received from server through websockets', settings)
      observer.onNext(settings)
    })
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})
