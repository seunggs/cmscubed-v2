import test from 'tape'
import {
  sanitizeRoute,
  sanitizeDomain,
  createQueryStr,
  deepCopyValues,
  getUpdatedPageContentFromSchemaChange,
  createContentUpdateObj,
  getPageContent,
  // IMPURE
  setPageContentSchema
} from './core'

test('sanitizeRoute()', assert => {
  const route = '/products/'
  const actual = sanitizeRoute(route)
  const expected = '/products'

  assert.equal(actual, expected,
    `Given a route string with a trailing slash, sanitizeRoute() should remove
    the trailing slash`)

  const route2 = '/products'
  const actual2 = sanitizeRoute(route2)
  const expected2 = '/products'

  assert.equal(actual2, expected2,
    `Given a route string with no trailing slash, sanitizeRoute() should do
    nothing`)

  const route3 = '/'
  const actual3 = sanitizeRoute(route3)
  const expected3 = '/'

  assert.equal(actual3, expected3,
    `Given a root route, sanitizeRoute() should do nothing`)

  assert.end()
})

test('sanitizeDomain()', assert => {
  const domain = 'http://www.blah.com'
  const actual = sanitizeDomain(domain)
  const expected = 'www.blah.com'

  assert.equal(actual, expected,
    `Given a domain with protocol, sanitizeDomain() should return a domain
    without the protocol`)

  /* -------------------- */

  const domain2 = 'https://www.blah.com'
  const actual2 = sanitizeDomain(domain2)
  const expected2 = 'www.blah.com'

  assert.equal(actual2, expected2,
    `Given a domain with ssl protocol, sanitizeDomain() should return a domain
    without the protocol`)

  /* -------------------- */

  const domain3 = '/www.blah.com'
  const actual3 = sanitizeDomain(domain3)
  const expected3 = '/www.blah.com'

  assert.equal(actual3, expected3,
    `Given a domain with a slash in front, sanitizeDomain() should return
    the same domain (since slash in front is not a protocol)`)

  /* -------------------- */

  const domain4 = 'www.blah.com'
  const actual4 = sanitizeDomain(domain4)
  const expected4 = 'www.blah.com'

  assert.equal(actual4, expected4,
    `Given a domain without a protocol, sanitizeDomain() should return
    the same domain`)

  assert.end()
})

test('createQueryStr()', assert => {
  const project = 'test'
  const env = 'preview'
  const locale = 'en-US'
  const route = '/products/pro'
  const queryArray = [{project}, {env}, {locale}, {route}]
  const actual = createQueryStr(queryArray)
  const expected = 'project=test&env=preview&locale=en-US&route=%2Fproducts%2Fpro'

  assert.equal(actual, expected,
    `Given an array of variables, createQueryStr() should create a query
    string such as var1Name=encodedVar1Value&var2Name=encodedVar2Value`)

  assert.end()
})

test('deepCopyValues()', assert => {
  const fromObj = {
    heading: 'Old heading',
    text: 'Home text',
    list: [
      'old list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      subBenefits: {
        benefit1: 'subBenefit 1'
      }
    }
  }
  const toObj = {
    heading: 'Changed heading',
    addedKey: 'Something',
    list: [
      'new list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual = deepCopyValues(fromObj, toObj)
  const expected = {
    heading: 'Old heading',
    addedKey: 'Something',
    list: [
      'old list',
      'item 2'
    ],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual, expected,
    `deepCopyValues() should deep copy all values from fromObj into toObj`)

  assert.end()
})

test('getUpdatedPageContentFromSchemaChange()', assert => {
  const currentPageContent = {
    heading: 'Old heading',
    text: 'Home text',
    list: ['old list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      subBenefits: {
        benefit1: 'subBenefit 1'
      }
    }
  }
  const newSchemaObj = {
    heading: 'Changed heading',
    addedKey: 'Something',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual = getUpdatedPageContentFromSchemaChange(currentPageContent, newSchemaObj)
  const expected = {
    heading: 'Old heading',
    addedKey: 'Something',
    list: ['old list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual, expected,
    `Given the current pageContent and a new schema object,
    getUpdatedPageContentFromSchemaChange() should return updated pageContent
    (with new keys from new schema object and old values from current
    pageContent)`)

  /* -------------------- */

  const currentPageContent2 = undefined
  const newSchemaObj2 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual2 = getUpdatedPageContentFromSchemaChange(currentPageContent2, newSchemaObj2)
  const expected2 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }

  assert.deepEqual(actual2, expected2,
    `getUpdatedPageContentFromSchemaChange() should return a pageContent that's
    identical to new schemaObj if the page doesn't already exist`)

  assert.end()
})

test('createContentUpdateObj()', assert => {
  const projectDomain = 'test.com'
  const env = 'preview'
  const locale = 'en-US'
  const route = '/products/pro'
  const updatedPageContent = {
    heading: 'Some heading',
    text: 'Some text'
  }
  const actual = createContentUpdateObj(projectDomain, env, locale, route, updatedPageContent)
  const expected = {projectDomain, env, locale, route, content: updatedPageContent}

  assert.deepEqual(actual, expected,
    `Given projectDomain, env, locale, route, updatedPageContent,
    createContentUpdateObj() should output an object with following keys and
    values: {project, env, locale, route, content}`)

  assert.end()
})

test('getPageContent()', assert => {
  const route = '/products/hacker'
  const rootContent = {
    "/": {
      heading: 'Home heading'
    },
    "/products": {
      heading: 'Products heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
      text: 'Hacker text'
    }
  }
  const actual = getPageContent(route, rootContent)
  const expected = {
    heading: 'Hacker heading',
    text: 'Hacker text'
  }

  assert.deepEqual(actual, expected,
    `Given a route string and rootC3Obj object, getPageContent() should
    output pageContent object`)

  /* -------------------- */

  const route2 = '/products/pro'
  const rootContent2 = {
    "/": {
      heading: 'Home heading'
    },
    "/products": {
      heading: 'Products heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
      text: 'Hacker text'
    }
  }
  const actual2 = getPageContent(route2, rootContent2)
  const expected2 = undefined

  assert.deepEqual(actual2, expected2,
    `Given no matching route, it should return undefined`)

  assert.end()
})

/* --- IMPURE --------------------------------------------------------------- */

test('setPageContentSchema()', assert => {
  const route = '/products'
  const rootContent = {
    '/': {
      heading: 'Home heading',
    },
    '/products': {
      heading: 'Products heading'
    }
  }
  const schemaObj = {
    heading: 'Products heading',
    text: 'Products text'
  }
  const actual = setPageContentSchema(route, rootContent, schemaObj)
  const expected = true

  assert.equal(actual, expected,
    `If schemaObj has different keys from current pageContent,
    setPageContentSchema() should return true`)

  /* -------------------- */

  const route2 = '/products'
  const rootContent2 = {
    '/': {
      heading: 'Home heading',
    },
    '/products': {
      heading: 'Products heading'
    }
  }
  const schemaObj2 = {
    heading: 'Products heading'
  }
  const actual2 = setPageContentSchema(route2, rootContent2, schemaObj2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `If schemaObj and pageContent are identical (not the same object, but
    same attributes and values), sendPageContent() should return false`)

  /* -------------------- */

  const route3 = '/products'
  const rootContent3 = undefined
  const schemaObj3 = {
    heading: 'Products heading'
  }
  const actual3 = setPageContentSchema(route3, rootContent3, schemaObj3)
  const expected3 = false

  assert.equal(actual3, expected3,
    `If rootContent supplied is nil, sendPageContent() should return false`)

  assert.end()
})
