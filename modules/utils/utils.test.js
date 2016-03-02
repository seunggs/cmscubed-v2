import test from 'tape'
import {
  convertWordToTitleCase,
  convertCamelCaseToTitleCase,
  convertDollarCaseToDotCase,
  convertToCamelCase,
  checkIsInteger
} from './'

test('convertWordToTitleCase()', assert => {
  const word = 'staging'
  const actual = convertWordToTitleCase(word)
  const expected = 'Staging'

  assert.equal(actual, expected,
    `Given a single word (i.e. with no spaces), convertWordToTitleCase()
    should convert the word into a titlecased word`)

  assert.end()
})

test('convertCamelCaseToTitleCase()', assert => {
  const input = 'someCamelCasedInput'
  const actual = convertCamelCaseToTitleCase(input)
  const expected = 'Some Camel Cased Input'

  assert.equal(actual, expected,
    `Given a camelcased input, convertCamelCaseToTitleCase() should return
    titlecased version`)

  /* ------------------------- */

  const input2 = ''
  const actual2 = convertCamelCaseToTitleCase(input2)
  const expected2 = ''

  assert.equal(actual2, expected2,
    `Given an empty string, convertCamelCaseToTitleCase() should return an
    empty string`)

  assert.end()
})

test('convertDollarCaseToDotCase()', assert => {
  const input = 'some$dollarCased$input'
  const actual = convertDollarCaseToDotCase(input)
  const expected = 'some.dollarCased.input'

  assert.equal(actual, expected,
    `Given a dollar cased input, convertDollarCaseToDotCase() should return
    titlecased version`)

  /* ------------------------- */

  const input2 = ''
  const actual2 = convertDollarCaseToDotCase(input2)
  const expected2 = ''

  assert.equal(actual2, expected2,
    `Given an empty string, convertDollarCaseToDotCase() should return an
    empty string`)

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

test('checkIsInteger()', assert => {
  const validValues = [42, '42', 4e2, ' 1 ']
  const invalidValues = ['', ' ', 42.1, '1a', '4e2a', null, undefined, NaN]

  validValues.forEach(value => {
    const actual = checkIsInteger(value)
    const expected = true
    assert.equal(actual, expected,
      `Given a valid integer (either in Number or String type),
      checkIsInteger() should return true`)
  })

  invalidValues.forEach(value => {
    const actual2 = checkIsInteger(value)
    const expected2 = false
    assert.equal(actual2, expected2,
      `Given an invalid integer in any type, checkIsInteger() should return
      true`)
  })

  assert.end()
})
