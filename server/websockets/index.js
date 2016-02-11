import {io} from '../../server'
import {
  contentUpdate$,
  pageFieldUpdate$,
  contentChangesFromDB$,
  contentGetInit$
} from '../observables/content'
import {
  getRouteContentFromDB,
  getPageContentFromDB,
  updateContentInDB,
  addBackupInDB
} from '../utils/db'
import {
  convertDBContentObjsToContent
} from '../../modules/core/content'

export default () => {
  contentUpdate$.subscribe(oldNewContentPair => {
    const project = 'cmscubed-test'
    const userEmail = 'blah@gmail.com'
    const locale = 'en-US'
    const oldPageContent = oldNewContentPair.oldVal
    const route = R.head(oldNewContentPair.newVal)
    const newPageContent = R.last(oldNewContentPair.newVal)
    const dbContentObj = {
      route: route,
      content: pageContent
    }
    const dbBackupObj = {
      project: project,
      locale: locale,
      backupType: "auto", // "manual" or "auto"
      changeType: "schema", // "schema" or "content"
      changeTime: new Date().getTime(),
      userEmail: userEmail,
      updatedRoute: route,
      prevContent: oldPageContent
    }

    updateContentInDB(project, locale, dbContentObj)
      .then(dbRes => {
        console.log('Successfully updated schema: ', dbRes)
        return addBackupInDB(dbBackupObj)
      })
      .then(dbRes => {
        console.log('Successfully inserted backupObj: ', dbRes)
      })
      .catch(err => {
        console.log('Error updating schema')
        io.emit('pageContent:errorFromDB', err)
      })
  })

  pageFieldUpdate$.subscribe(data => {
    io.emit('pageContentField:updateFromServer', data)
  })

  contentChangesFromDB$.subscribe(dbContentObjs => {
    const content = convertDBContentObjsToContent(dbContentObjs)
    io.emit('routeContent:fromDB', content)
  })
}
