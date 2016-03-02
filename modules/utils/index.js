import R from 'ramda'

const log = x => { console.log(x); return x }

export const convertWordToTitleCase = R.compose(R.join(''), R.adjust(R.toUpper, 0))

// convertCamelCaseToTitleCase :: String -> String
export const convertCamelCaseToTitleCase = R.curry(input => {
  const isUpper = letter => letter === R.toUpper(letter)
  return R.compose(R.join(''), R.adjust(R.toUpper, 0), R.map(R.ifElse(isUpper, R.add(' '), R.identity)))(input)
})

// convertCamelCaseToDotCase :: String -> string
export const convertDollarCaseToDotCase = R.curry(input => {
  return R.replace(/\$/g, '.')(input)
})

// convertToCamelCase :: String -> String
export const convertToCamelCase = R.curry(text => {
  const titleCasedWords = R.compose(R.map(R.compose(R.join(''), R.adjust(R.toUpper, 0), R.split(''))), R.split(' '))(text)
  const firstWordWithLowerCasedFirstLetter = R.compose(R.join(''), R.adjust(R.toLower, 0), R.head)(titleCasedWords)
  const camelCasedText = R.compose(R.join(''), R.prepend(firstWordWithLowerCasedFirstLetter), R.tail)(titleCasedWords)
  return camelCasedText
})

// checkIsInteger :: * -> Boolean
export const checkIsInteger = R.curry(value => {
  if (isNaN(value)) { return false }
  var x = parseFloat(value)
  return (x | 0) === x
})
