import {io} from '../../server'
import {
  receiveRouteContentRequest$,
  // contentUpdate$,
  contentFieldUpdate$,
  // contentChangesFromDB$,
  // contentGetInit$
} from '../observables/content'
import {
  convertDBContentObjsToContent
} from '../../modules/core/content'

export default () => {
  console.log('Websocket observable subscriptions running')
  receiveRouteContentRequest$.subscribe(routeContent => {
    console.log('Sending routeContent:fromDB inside receiveRouteContentRequest$')
    io.emit('routeContent:fromDB', routeContent)
  })

  // contentUpdate$.subscribe(oldNewContentPair => {
  //   const project = oldNewContentPair.project
  //   const locale = oldNewContentPair.locale // if 'all', update all locales
  //   const oldPageContent = oldNewContentPair.oldVal
  //   const route = R.head(oldNewContentPair.newVal)
  //   const newPageContent = R.last(oldNewContentPair.newVal)
  //   const dbContentObj = {
  //     route: route,
  //     content: pageContent
  //   }
  //   const dbBackupObj = {
  //     project: project,
  //     locale: locale,
  //     changeType: "schema", // "schema" or "content"
  //     changeTime: new Date().getTime(),
  //     updatedRoute: route,
  //     prevContent: oldPageContent
  //   }
  //
  //   updateContentInDB(project, locale, dbContentObj)
  //     .then(dbRes => {
  //       console.log('Successfully updated schema: ', dbRes)
  //       return addBackupInDB(dbBackupObj)
  //     })
  //     .then(dbRes => {
  //       console.log('Successfully inserted backupObj: ', dbRes)
  //     })
  //     .catch(err => {
  //       console.log('Error updating schema')
  //       io.emit('pageContent:errorFromDB', err)
  //     })
  // })
  //
  contentFieldUpdate$.subscribe(data => {
    io.emit('contentField:updateFromServer', data)
  })

  // contentChangesFromDB$.subscribe(dbContentObjs => {
  //   const content = convertDBContentObjsToContent(dbContentObjs)
  //   io.emit('routeContent:fromDB', content)
  // })
}
