import R from 'ramda'

const log = x => { console.log(x); return x }

// convertCamelCaseToTitleCase :: String -> String
export const convertCamelCaseToTitleCase = input => {
  const isUpper = letter => letter === R.toUpper(letter)
  return R.compose(R.join(''), R.adjust(R.toUpper, 0), R.map(R.ifElse(isUpper, R.add(' '), R.identity)))(input)
}

// convertToCamelCase :: String -> String
export const convertToCamelCase = text => {
  const titleCasedWords = R.compose(R.map(R.compose(R.join(''), R.adjust(R.toUpper, 0), R.split(''))), R.split(' '))(text)
  const firstWordWithLowerCasedFirstLetter = R.compose(R.join(''), R.adjust(R.toLower, 0), R.head)(titleCasedWords)
  const camelCasedText = R.compose(R.join(''), R.prepend(firstWordWithLowerCasedFirstLetter), R.tail)(titleCasedWords)
  return camelCasedText
}
