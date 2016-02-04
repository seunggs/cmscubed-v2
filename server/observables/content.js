import Rx from 'rx-lite'
import R from 'ramda'
import {io} from '../../server'
import rdb from '../config/rdbdash'

export const contentUpdate$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    io.on('connection', socket => {
      socket.on('pageContent:update', data => {
        observer.onNext(data)
      })
    })
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})

export const pageFieldUpdate$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    io.on('connection', socket => {
      socket.on('pageContentField:update', data => {
        observer.onNext(data)
      })
    })
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})

export const contentChangesFromDB$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    rdb.table('contents')
      .changes()
      .run({cursor: true})
      .then(cursor => {
        cursor.each((err, row) => {
          if (err) { observer.onError(err) }
          // wrap it in array to make it consistent with other all other dbContent queries
          const dbContentObjs = [row.new_val]
          observer.onNext(dbContentObjs)
        })
      })
      .catch(err => observer.onError(err))
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})

export const content$ = Rx.Observable.combineLatest()
