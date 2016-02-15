/* --- PURE ----------------------------------------------------------------- */

// getUpdatedPageContentFromSchemaChange :: {*} -> {*} -> {*}
export const getUpdatedPageContentFromSchemaChange = R.curry((currentPageContent, newSchemaObj) => {
  return R.isNil(currentPageContent) ? newSchemaObj : deepCopyValues(currentPageContent, newSchemaObj)
})

// getPageContent :: String -> {*} -> {*}
export const getPageContent = R.curry((route, rootContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  const pageContent = R.prop(sanitizedRoute, rootContent)
  return pageContent
})

// createContentUpdateObj :: String -> String -> String -> {*} -> [*]
export const createContentUpdateObj = R.curry((project, locale, route, pageContent) => {
  const sanitizedRoute = sanitizeRoute(route)
  return [project, locale, sanitizedRoute, pageContent]
})

/* --- EVENT ---------------------------------------------------------------- */

const sendEnvSetEvent = (projectName, env) => {
  const envSetEvent = new CustomEvent('env:set', {detail: {projectName: projectName, env: env}})
  document.dispatchEvent(envSetEvent)
}

/* --- OBSERVABLE ----------------------------------------------------------- */

const waitForEnv$ = Rx.Observable.fromEvent(document, 'env:set')
  .map(e => e.detail)

/* --- IMPURE --------------------------------------------------------------- */

// TODO: add test
export const sendPageContent = R.curry((oldPageContent, contentUpdateObj) => {
  socket.emit('pageContent:update', {oldVal: oldPageContent, newVal: contentUpdateObj})
  return 'sent'
})

const setPageContentSchema = (route, rootContent, schemaObj) => {
  waitForEnv$.subscribe(projectNameAndEnv => {
    const project = projectNameAndEnv.projectName
    const env = projectNameAndEnv.env
    const pageContent = getPageContent(route, rootContent)
    const updatedPageContent = getUpdatedPageContentFromSchemaChange(pageContent, schemaObj)
    // Only send if content has changed
    if (!R.equals(pageContent, updatedPageContent)) {
      const contentUpdateObj = createContentUpdateObj(project, env, route, updatedPageContent)
      sendPageContent(pageContent, contentUpdateObj)
      return 'sent'
    }
    return 'not sent'
  })
}
