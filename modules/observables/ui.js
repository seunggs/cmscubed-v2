import Rx from 'rx-lite'
import R from 'ramda'

export const createOnClick$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'click')
}

export const createOnBlur$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'blur')
}

export const createOnKeyUp$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'keyup')
    .map(e => e.target.innerText)
}

export const createContentFieldFromEditor$ = thisElem => {
  return Rx.Observable.fromEvent(thisElem, 'keyup')
    .map(e => e.target.innerHTML)
    .debounce(200)
}
