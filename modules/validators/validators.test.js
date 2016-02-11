import test from 'tape'
import {
  checkIsNotEmpty,
  checkIsCamelCased
} from './'

test('checkIsNotEmpty()', assert => {
  const input = ''
  const actual = checkIsNotEmpty(input)
  const expected = false

  assert.equal(actual, expected,
    `Given an empty input, checkIsNotEmpty() should return false`)

  /* -------------------- */

  const input2 = ''
  const actual2 = checkIsNotEmpty(input2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `Given an undefined input, checkIsNotEmpty() should return false`)

  /* -------------------- */

  const input3 = 'Some value'
  const actual3 = checkIsNotEmpty(input3)
  const expected3 = true

  assert.equal(actual3, expected3,
    `Given a valid string input, checkIsNotEmpty() should return true`)

  assert.end()
})

test('checkIsCamelCased()', assert => {
  const text = 'someKindOfText'
  const actual = checkIsCamelCased(text)
  const expected = true

  assert.equal(actual, expected,
    `Given a camelcased text, checkIsCamelCased() should return true`)

  /* -------------------- */

  const text2 = 'Some kind of Text'
  const actual2 = checkIsCamelCased(text2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `Given a phrase (i.e. with spaces), checkIsCamelCased() should return false`)

  /* -------------------- */

  const text3 = 'SomeKindOfText'
  const actual3 = checkIsCamelCased(text3)
  const expected3 = false

  assert.equal(actual3, expected3,
    `Given a titlecased text, checkIsCamelCased() should return false`)

  /* -------------------- */

  const text4 = 'somekindoftext'
  const actual4 = checkIsCamelCased(text4)
  const expected4 = true

  assert.equal(actual4, expected4,
    `Given a lowercased text, checkIsCamelCased() should return true`)

  /* -------------------- */

  const text5 = ''
  const actual5 = checkIsCamelCased(text5)
  const expected5 = false

  assert.equal(actual5, expected5,
    `Given an empty string, checkIsCamelCased() should return false`)

  /* -------------------- */

  const text6 = undefined
  const actual6 = checkIsCamelCased(text6)
  const expected6 = false

  assert.equal(actual6, expected6,
    `Given an undefined string, checkIsCamelCased() should return false`)

  /* -------------------- */

  const text7 = ' camelCaseStartingWithSpace'
  const actual7 = checkIsCamelCased(text7)
  const expected7 = true

  assert.equal(actual7, expected7,
    `Given a camelcased string that starts with space, checkIsCamelCased() should
    return true`)

  assert.end()
})
