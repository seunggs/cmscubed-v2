import R from 'ramda'
import rdb from '../config/rdbdash'

// getRouteContentFromDB :: String -> Promise of {*}
export const getRouteContentFromDB = R.curry((project, route) => {
  return rdb.table('contents')
    .getAll(project, {index: 'project'})
    .filter(contentEntry => {
      return contentEntry('route').match('^'+route)
    })
    .run()
})

// getPageContentFromDB :: String -> Promise of {*}
export const getPageContentFromDB = R.curry((project, route) => {
  return rdb.table('contents')
    .getAll(project, {index: 'project'})
    .getAll(route, {index: 'route'})
    .run()
})

/* --- IMPURE --------------------------------------------------------------- */

// updateContentInDB :: String -> String -> {*} -> Promise of {*}
export const updateContentInDB = R.curry((project, locale, dbContentObj) => {
  return rdb.table('contents')
    .getAll(project, {index: 'project'})
    .filter(
      r.row('locale').eq(locale)
    )
    .update(dbContentObj)
    .run()
})

// addBackupInDB :: {*} -> Promise of {*}
export const addBackupInDB = R.curry(dbBackupObj => {
  return rdb.table('backups')
    .insert(dbBackupObj)
    .run()
})
