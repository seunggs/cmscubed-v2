import test from 'tape'
import {
  convertCamelCaseToTitleCase,
  convertToCamelCase
} from './'

test('convertCamelCaseToTitleCase()', assert => {
  const input = 'someCamelCasedInput'
  const actual = convertCamelCaseToTitleCase(input)
  const expected = 'Some Camel Cased Input'

  assert.equal(actual, expected,
    `Given a camelcased input, convertCamelCaseToTitleCase() should return titlecased version`)

  /* ------------------------- */

  const input2 = ''
  const actual2 = convertCamelCaseToTitleCase(input2)
  const expected2 = ''

  assert.equal(actual2, expected2,
    `Given an empty string, convertCamelCaseToTitleCase() should return an empty string`)

  assert.end()
})

test('convertToCamelCase()', assert => {
  const text = 'Some kind of Text'
  const actual = convertToCamelCase(text)
  const expected = 'someKindOfText'

  assert.equal(actual, expected,
    `Given any string, convertToCamelCase() should return a camel cased string`)

  assert.end()
})
