import Rx from 'rx-lite'
import R from 'ramda'
import rdb from '../config/rdbdash'
import {convertDBContentObjsToContent} from '../../modules/core/content'
import {getContentEnv} from '../../modules/client/core'

// getProjectDetailsBySecondaryIndexFromDB$$ :: String -> String -> Observable({*})
export const getProjectDetailsBySecondaryIndexFromDB$$ = (key, value) => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      rdb.table('projects')
        .getAll(value, {index: key})
        .run()
        .then(projectDetails => {
          console.log(projectDetails)
          observer.onNext(projectDetails)
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

// getProjectDetailsByDomainFromDB$$ :: String -> Observable({*})
export const getProjectDetailsByDomainFromDB$$ = domain => {
  return Rx.Observable.create(observer => {
    let cancelled = false

    if (!cancelled) {
      rdb.table('projects')
        .filter(function(project) {
          return project('prodDomains').contains(domain)
             .or(project('stagingDomains').contains(domain))
             .or(project('previewProdDomains').contains(domain))
             .or(project('previewStagingDomains').contains(domain))
        })
        .run()
        .then(projectDetails => {
          console.log(projectDetails)
          observer.onNext(projectDetails)
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

// createUserInDB$$ :: {*} -> Observable(-> {*})
// Create a new user in Users table IF it doesn't already exist (otherwise, return {}) and return original userObj
export const createUserInDB$$ = userObj => {
  const userEmail = userObj.email
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('users')
        .getAll(userEmail, {index: 'email'})
        .run()
        .then(dbRes => {
          if (R.isEmpty(dbRes)) {
            return rdb.table('users')
              .insert(userObj)
              .run()
          } else {
            return {}
          }
        })
        .then(dbRes => {
          console.log('createUserInDB$$ dbRes: ', dbRes)
          observer.onNext(userObj)
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

// getUserFromDB$$ :: {*} -> Observable(-> {*})
// Get a specific user from users table (returns a single userObj)
export const getUserFromDB$$ = userEmail => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('users')
        .getAll(userEmail, {index: 'email'})
        .run()
        .then(userObjs => {
          console.log(userObjs)
          observer.onNext(userObjs)
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

// updateUserInDB$$ :: {*} -> Observable(-> {*})
// Update a specific userObj in Users table (returns the original userUpdateObj)
export const updateUserInDB$$ = (userEmail, userUpdateObj) => {
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('users')
        .getAll(userEmail, {index: 'email'})
        .update(userUpdateObj)
        .run()
        .then(dbRes => {
          console.log(dbRes)
          observer.onNext(userUpdateObj)
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

// createProjectInDB$$ :: {*} -> Observable(-> {*})
// Create a new projectDetailsObj in Projects table (returns the original projectDetailsObj)
export const createProjectInDB$$ = projectDetails => {
  const {projectDomain} = projectDetails
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('projects')
        .getAll(projectDomain, {index: 'projectDomain'})
        .run()
        .then(dbRes => {
          console.log(dbRes)
          if (R.isEmpty(dbRes)) {
            return rdb.table('projects')
              .insert(projectDetails)
              .run()
          } else {
            return {}
          }
        })
        .then(dbRes => {
          console.log(dbRes)
          observer.onNext(projectDetails)
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

// getRouteContentFromDB$$ :: {*} -> Observable(-> {*})
// Get all contents that are children of a given route in Contents_[locale]_[env] table
// Returns a single client-side routeContent object
export const getRouteContentFromDB$$ = (projectDomain, env, locale, route) => {
  const contentEnv = getContentEnv(env)
  const localeWithUnderscore = locale.replace('-', '_')
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      // readMode: 'outdated' will often be less than a sec out of date, but will improve read performance
      rdb.table('contents_' + localeWithUnderscore + '_' + contentEnv, {readMode: 'outdated'})
        .getAll(projectDomain, {index: 'projectDomain'})
        .filter(row => row('route').match('^'+route))
        .run()
        .then(dbContentObjs => {
          const routeContent = convertDBContentObjsToContent(dbContentObjs)
          console.log('routeContent: ', routeContent)
          observer.onNext(routeContent)
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

// getSelectRouteContentFromDB$$ :: {*} -> Observable(-> {*})
// Get all contents that are children of a given route in Contents_[locale]_[env] table WITH ROUTE EXCLUSIONS
// Returns a single client-side routeContent object
export const getSelectRouteContentFromDB$$ = (projectDomain, env, locale, route, excludedRoutes) => {
  const contentEnv = getContentEnv(env)
  const localeWithUnderscore = locale.replace('-', '_')
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      // Dynamically add filtering to db query based on excludedRoutes
      const constructDBQuery = excludedRoutes => {
        // readMode: 'outdated' will often be less than a sec out of date, but will improve read performance
        const projectQuery = rdb.table('contents_' + localeWithUnderscore + '_' + contentEnv, {readMode: 'outdated'})
          .getAll(projectDomain, {index: 'projectDomain'})

        const partialQueryForExclusions = excludedRoutes.reduce((prev, curr) => {
          return prev.filter(row => row('route').match('^'+curr).not())
        }, projectQuery)

        return partialQueryForExclusions
          .filter(row => row('route').match('^'+route))
          .run()
      }

      constructDBQuery(excludedRoutes)
        .then(dbContentObjs => {
          const routeContent = convertDBContentObjsToContent(dbContentObjs)
          console.log('routeContent: ', routeContent)
          observer.onNext(routeContent)
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

// TODO: OPTIMIZE WITH MULTI INDEXES
// getPageContentFromDB$$ :: {*} -> Observable(-> {*})
// Get dbContentObj of a given route only (not children) in Contents-[env] table
// Returns a single client-side routeContent object)
export const getPageContentFromDB$$ = (projectDomain, env, locale, route) => {
  const contentEnv = getContentEnv(env)
  const localeWithUnderscore = locale.replace('-', '_')
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('contents_' + localeWithUnderscore + '_' + contentEnv)
        .getAll(projectDomain, {index: 'projectDomain'})
        .filter({route: route})
        .run()
        .then(dbContentObjs => {
          routeContent = convertDBContentObjsToContent(R.head(dbContentObjs))
          observer.onNext(routeContent)
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

// updatePageContentInDB$$ :: {*} -> Observable(-> {*})
// Update dbContentObj of a given route only (not children) in Contents-[env] table (returns a dbRes object)
export const updatePageContentInDB$$ = (projectDomain, env, locale, route, content) => {
  const contentEnv = getContentEnv(env)
  const localeWithUnderscore = locale.replace('-', '_')
  return Rx.Observable.create(observer => {
    let cancelled = false
    if (!cancelled) {
      rdb.table('contents_' + localeWithUnderscore + '_' + contentEnv)
        .getAll(projectDomain, {index: 'projectDomain'})
        .filter({route: route})
        .run()
        .then(dbRes => {
          if (R.equals(0, dbRes.length)) {
            const dbContentObj = R.dissoc('env', contentUpdateObj)
            return rdb.table('contents_' + contentEnv)
              .insert(dbContentObj)
          } else {
            return rdb.table('contents_' + contentEnv)
              .getAll(projectDomain, {index: 'projectDomain'})
              .filter({locale: locale})
              .filter({route: route})
              .update({content: content})
          }
        })
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
