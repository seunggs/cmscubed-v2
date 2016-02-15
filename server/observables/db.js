import Rx from 'rx-lite'
import rdb from '../config/rdbdash'

// getProjectDetailsBySecondaryIndex$$ :: String -> String -> Observable({*})
export const getProjectDetailsBySecondaryIndex$$ = (key, value) => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      rdb.table('projects')
        .getAll(value, {index: key})
        .run()
        .then(dbRes => {
          console.log(dbRes)
          observer.onNext(dbRes)
          observer.onCompleted()
        })
        .catch(err => observer.onError(err))
    }

    return () => {
      cancelled = true
      console.log('Disposed')
    }
  })
}
