import test from 'tape'
import {
  createStateIds,
  getElemState
} from './state'

test('createStateIds()', assert => {
  const numOfFormElems = 3
  const pathname = '/some/path'
  const actual = createStateIds(numOfFormElems, pathname)
  const expected = [
    '/some/path-0',
    '/some/path-1',
    '/some/path-2'
  ]

  assert.deepEqual(actual, expected,
    `Given a number of length and pathname, createStateIds() should create
    an array of ids in the form of "route-num"`)

  /* -------------------- */

  const numOfFormElems2 = 3
  const elemName2 = 'someElem'
  const actual2 = createStateIds(numOfFormElems2, elemName2)
  const expected2 = [
    'someElem-0',
    'someElem-1',
    'someElem-2'
  ]

  assert.deepEqual(actual2, expected2,
    `Given a number of length and elemName, createStateIds() should create
    an array of ids in the form of "elemName-num"`)

  assert.end()
})

test('getElemState()', assert => {
  const id = '/setup-1'
  const rootState = {
    "/setup-1": {
      isValid: null,
      isTouched: false,
      errorMsgs: [
        'This field is required',
        'Project name must be camelcased'
      ]
    }
  }
  const actual = getElemState(id, rootState)
  const expected = {
    isValid: null,
    isTouched: false,
    errorMsgs: [
      'This field is required',
      'Project name must be camelcased'
    ]
  }

  assert.deepEqual(actual, expected,
    `getElemState() should return the state obj of a given id`)

  /* -------------------- */

  const id2 = '/setup-x'
  const rootState2 = {
    "/setup-1": {
      isValid: null,
      isTouched: false,
      errorMsgs: [
        'This field is required',
        'Project name must be camelcased'
      ]
    }
  }
  const actual2 = getElemState(id2, rootState2)
  const expected2 = {}

  assert.deepEqual(actual2, expected2,
    `Given a non-existing id, getElemState() should return {}`)

  /* -------------------- */

  const id3 = '/setup-x'
  const rootState3 = undefined
  const actual3 = getElemState(id3, rootState3)
  const expected3 = {}

  assert.deepEqual(actual3, expected3,
    `Given an undefined rootState, getElemState() should return {}`)

  /* -------------------- */

  const id4 = '/setup-x'
  const rootState4 = {}
  const actual4 = getElemState(id4, rootState4)
  const expected4 = {}

  assert.deepEqual(actual4, expected4,
    `Given a rootState of {}, getElemState() should return an
    {}`)

  assert.end()
})
