import Rx from 'rx-lite'
import R from 'ramda'
import {io} from '../../server'
import rdb from '../config/rdbdash'
import {convertDBContentObjsToContent} from '../../modules/core/content'
import {getRouteContentFromDB$$} from './db'

export const receiveRouteContentRequest$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    io.on('connection', socket => {
      socket.on('routeContent:get', ({projectDomain, env, locale, route}) => {
        console.log('routeContent:get received!', projectDomain, env, locale, route)
        if (!R.isNil(projectDomain) && !R.isNil(env) && !R.isNil(locale)) {
          getRouteContentFromDB$$(projectDomain, env, locale, route).subscribe(
            routeContent => observer.onNext(routeContent),
            err => observer.onError(err)
          )
        } else {
          // For initial request (before projectDomain, env, locale is available)
          observer.onNext({'/': {}})
        }
      })
    })
  }
  return () => {
    cancelled = true
    console.log('receiveRouteContentRequest$ disposed')
  }
})

// export const contentUpdate$ = Rx.Observable.create(observer => {
//   let cancelled = false
//   if (!cancelled) {
//     io.on('connection', socket => {
//       socket.on('pageContent:update', data => {
//         observer.onNext(data)
//       })
//     })
//   }
//   return () => {
//     cancelled = true
//     console.log('Disposed')
//   }
// })
//
// This is for realtime update of the content for preview only
// As such, it doesn't need to hit DB
export const contentFieldUpdate$ = Rx.Observable.create(observer => {
  let cancelled = false
  if (!cancelled) {
    io.on('connection', socket => {
      socket.on('contentField:update', data => {
        observer.onNext(data)
      })
    })
  }
  return () => {
    cancelled = true
    console.log('Disposed')
  }
})
//
// export const contentChangesFromDB$ = Rx.Observable.create(observer => {
//   let cancelled = false
//   if (!cancelled) {
//     rdb.table('contents')
//       .changes()
//       .run({cursor: true})
//       .then(cursor => {
//         cursor.each((err, row) => {
//           if (err) { observer.onError(err) }
//           // wrap it in array to make it consistent with other all other dbContent queries
//           const dbContentObjs = [row.new_val]
//           observer.onNext(dbContentObjs)
//         })
//       })
//       .catch(err => observer.onError(err))
//   }
//   return () => {
//     cancelled = true
//     console.log('Disposed')
//   }
// })
//
// export const content$ = Rx.Observable.combineLatest()
