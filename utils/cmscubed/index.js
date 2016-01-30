import {
  content$,
  contentHttp$
} from './observables/content'

import {
  convertQueryToPathArray,
  convertPathArrayToRoute,
  convertRouteToPathArray,
  diffC3ObjKeysForAdding,
  diffC3ObjKeysForRemoving,
  convertContentToC3Obj,
  convertC3ObjToContent,
  getPageContent,
  createRouteTree,
  addPageContentToRootContent,
  getContentKeysToAdd,
  getContentKeysToRemove
} from './utils/core'

export {
  content$,
  contentHttp$,
  convertQueryToPathArray,
  convertPathArrayToRoute,
  convertRouteToPathArray,
  diffC3ObjKeysForAdding,
  diffC3ObjKeysForRemoving,
  convertContentToC3Obj,
  convertC3ObjToContent,
  getPageContent,
  createRouteTree,
  addPageContentToRootContent,
  getContentKeysToAdd,
  getContentKeysToRemove
}
