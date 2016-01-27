import Rx from 'rx-lite'
import config from '../config/'

export let contentHttp$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    fetch('//127.0.0.1:8888/api/contents?path=[products]')
      .then(res => res.json())
      .then(body => {
        observer.onNext(body)
        observer.onCompleted()
      })
      .catch(err => {
        observer.onError(err)
      })
  }

  return () => {
    cancelled = true
    console.log('Disposed')
  }
})

export let content$ = Rx.Observable.create(observer => {
  const socket = io.connect(config.host + ':' + config.port)
  socket.on('content', content => {
    console.log('Content obj received from server through websockets', content)
    observer.onNext(content)
    observer.onCompleted()
  })

  return () => {
    // socket.disconnect()
    console.log('Content socket.io event disposed')
  }
})
