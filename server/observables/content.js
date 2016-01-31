import Rx from 'rx-lite'
import io from '../config/websockets'
import rdb from '../config/rdbdash'
import {addKeysToC3Obj} from '../../utils/cmscubed/'
import {rootC3ObjFromDB$} from './db'

contentKeysToAdd$ = Rx.Observable.create(observer => {
  io.on('addContentKeys', data => {
    observer.onNext(data)
  })
  return () => console.log('Disposed')
})

contentKeysToAdd$.subscribe(keysToAdd => {
  const newRootC3Obj = addKeysToC3Obj(keysToAdd, rootC3Obj)

  // add to DB
  rdb.table()
})
