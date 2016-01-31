import Rx from 'rx-lite'
import io from '../config/websockets'
import rdb from '../config/rdbdash'



export const rootC3ObjFromDB$ = Rx.Observable.create(observer => {
  rdb.table('contents')
    .changes()
    .run({cursor: true})
    .then(cursor => {
      cursor.each((err, row) => {
        if (err) { observer.onError(err) }
        const rootC3Obj = row.new_val
        observer.onNext(rootC3Obj)
      })
    })
    .catch(err => observer.onError(err))
  return () => console.log('Disposed')
})


// REFERENCE ONLY - example data structure inside DB contents table
const exDbContentDataStructure = {
  project1: {
    "en-US": {
      content: {
        $global: {
          cta: "Free trial"
        },
        webContent: {
          "/": {
            heading: "Home heading"
          },
          "/products": {
            heading: "Products heading",
            text: "Products text"
          },
          "/products/pro": {
            heading: "Pro heading"
          }
        },
        blogContent: {
          "/blog": {
            heading: "Blog heading"
          }
        }
      },
      changes: {
        1: {
          backupType: "manual", // "manual" or "auto"
          changeType: "schema", // "schema" or "content"
          changeTime: 1454170581,
          user: "blah@gmail.com",
          updatedRoute: "/products",
          prevContent: {
            heading: "Products heading"
          }
        }
      }
    },
    "fr-FR": {

    }
  }
}
