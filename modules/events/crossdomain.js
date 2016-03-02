export const sendCrossDomainEvent = (receivingWindow, msg, targetUrl) => {
  receivingWindow.postMessage(msg, targetUrl)
}
