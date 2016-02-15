export const sendEnvSetEvent = (projectName, env) => {
  if (typeof(CustomEvent) !== 'undefined') {
    const envSetEvent = new CustomEvent('env:set', {detail: {projectName: projectName, env: env}})
    document.dispatchEvent(envSetEvent)
  }
}

// export const sendSetPageContentSchemaEvent = updatedPageContent => {
//   if (typeof(CustomEvent) !== 'undefined') {
//     const pageContentSchemaEvent = new CustomEvent('pageContentSchema:set', {detail: updatedPageContent})
//     document.dispatchEvent(pageContentSchemaEvent)
//   }
// }
