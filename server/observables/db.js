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



// REFERENCE ONLY - example data structures in DB
const exContentsDBEntry1 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '$global',
  content: {
    cta: "Free trial"
  }
}
const exContentsDBEntry2 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '/',
  content: {
    heading: "Home heading"
  }
}
const exContentsDBEntry3 = {
  project: 'Project Name',
  locale: 'en-US',
  route: '/products/pro',
  content: {
    heading: "Pro heading",
    text: "Pro text"
  }
}

const exBackupsDBEntry = {
  project: 'Project Name',
  locale: 'en-US',
  changeType: "schema", // "schema" or "content"
  time: 1454170581,
  route: "/products",
  prevContent: {
    heading: "Products heading"
  }
}

const exUsersDBEntry = {
  project: "Project1",
  email: "email@gmail.com",
  firstName: "Sam",
  lastName: "Smith",
  accessLevel: "superadmin"
}

const exProjectsDBEntry = {
  project: 'Project Name',
  domain: 'blah.com',
  stagingDomain: 'staging.blah.com',
  previewDomain: 'preview.blah.com',
  users: ['blah@gmail.com', 'blahblah@gmail.com'],
  defaultLocale: 'en-US',
  locales: ["en-US", "fr-FR"],
  domainMap: {
    "en-US": "blah.com"
  }
}

const exMetadataDBEntry = {
  project: 'Project Name',
  userEmail: "email@gmail.com",
  recentlyViewedRoutes: [
    '1',
    '2'
  ],
  newlyAddedRoutes: [
    '1',
    '2'
  ]
}
