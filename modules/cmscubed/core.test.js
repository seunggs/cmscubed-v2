import test from 'tape'
import sinon from 'sinon'
import {
  convertQueryToPathArray,
  convertPathArrayToRoute,
  convertRouteToPathArray,
  sanitizeRoute,
  deepCopyValues,
  getUpdatedPageContentFromSchemaChange,
  getPageContent,
  createRoutePageContentPair,
  createRouteTree,
  isValidLocale,
  convertDBContentObjsToContent,
  isContent,
  // IMPURE
  sendPageContent,
  setContentSchema
} from './core'

test('convertPathArrayToRoute()', assert => {
  const pathArray = ['products', 'pro', 'overview']
  const actual = convertPathArrayToRoute(pathArray)
  const expected = '/products/pro/overview'

  assert.equal(actual, expected,
    `Given a path array, convertPathArrayToRoute() should output a route string`)

  assert.end()
})

test('convertRouteToPathArray()', assert => {
  const route = '/products/pro/overview'
  const actual = convertRouteToPathArray(route)
  const expected = ['products', 'pro', 'overview']

  assert.deepEqual(actual, expected,
    `Given a route string, convertRouteToPathArray() should output a path array`)

  assert.end()
})

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

test('createRouteTree()', assert => {
  const rootContent = {
    "/products": {
      heading: 'Products heading'
    },
    "/": {
      heading: 'Home heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
    },
    "/products/pro": {
      heading: 'Pro heading',
    },
    "/products/pro/overview": {
      heading: 'Pro overview heading',
    },
    "/about": {
      heading: 'About heading'
    },
    "/faq/intro": {
      heading: 'FAQ intro'
    }
  }
  const actual = createRouteTree(rootContent)
  const expected = [
    {
      path: '/',
      childRoutes: [
        {
          path: 'products',
          childRoutes: [
            {
              path: 'hacker',
              childRoutes: []
            },
            {
              path: 'pro',
              childRoutes: [
                {
                  path: 'overview',
                  childRoutes: []
                }
              ]
            }
          ]
        },
        {
          path: 'about',
          childRoutes: []
        },
        {
          path: 'faq',
          childRoutes: [
            {
              path: 'intro',
              childRoutes: []
            }
          ]
        }
      ]
    }
  ]

  assert.deepEqual(actual, expected,
    `Given a rootContent, createRouteTree() should output a tree of all routes`)

  /* -------------------- */

  const rootContent2 = {
    "/": {
      heading: 'Home heading'
    },
    "/about": {
      heading: 'About heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
    },
    "/products/pro": {
      heading: 'Pro heading',
    }
  }
  const actual2 = createRouteTree(rootContent2)
  const expected2 = [
    {
      path: '/',
      childRoutes: [
        {
          path: 'about',
          childRoutes: []
        },
        {
          path: 'products',
          childRoutes: [
            {
              path: 'hacker',
              childRoutes: []
            },
            {
              path: 'pro',
              childRoutes: []
            }
          ]
        }
      ]
    }
  ]

  assert.deepEqual(actual2, expected2,
    `Given a rootContent with missing parent routes, createRouteTree() should
    still output a tree of all routes including all parent routes of the nested
    routes`)

  assert.end()
})

test('isValidLocale()', assert => {
  const locale = 'en-US'
  const actual = isValidLocale(locale)
  const expected = true

  assert.equal(actual, expected,
    `Given a valid locale string, isValidLocale() should return true`)

  /* -------------------- */

  const locale2 = 'en-us'
  const actual2 = isValidLocale(locale2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `Given an invalid locale string, isValidLocale() should return false`)

  /* -------------------- */

  const locale3 = 'en_us'
  const actual3 = isValidLocale(locale3)
  const expected3 = false

  assert.equal(actual3, expected3,
    `Given an invalid locale string, isValidLocale() should return false`)

  assert.end()
})

test('convertDBContentObjsToContent()', assert => {
  const dbContentObjs = [
    {
      project: 'Project1',
      route: '/products',
      content: {
        heading: 'Products heading',
        text: 'Products text'
      }
    },
    {
      project: 'Project1',
      route: '/products/pro',
      content: {
        heading: 'Pro heading',
        text: 'Pro text'
      }
    }
  ]
  const actual = convertDBContentObjsToContent(dbContentObjs)
  const expected = {
    "/products": {
      heading: 'Products heading',
      text: 'Products text'
    },
    "/products/pro": {
      heading: 'Pro heading',
      text: 'Pro text'
    }
  }

  assert.deepEqual(actual, expected,
    `Given dbContentObj array from DB, convertDBContentObjsToContent() should
    return a content object consumable by the client`)

  assert.end()
})

test('isContent()', assert => {
  const content = {
    "/products": {
      heading: 'Products heading',
      text: 'Products text'
    },
    "/products/pro": {
      heading: 'Pro heading',
      text: 'Pro text'
    }
  }
  const actual = isContent(content)
  const expected = true

  assert.equal(actual, expected,
    `Given a content object with routes as root keys, isContent() should
    return true`)

  /* -------------------- */

  const content2 = {
    "something": {
      text: 'Some text'
    },
    "buttonState": {
      heading: 'Button heading',
      text: 'Button text'
    }
  }
  const actual2 = isContent(content2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `Given a non-content object with no routes as root keys, isContent()
    should return false`)

  assert.end()
})

/* --- IMPURE --------------------------------------------------------------- */

test('setContentSchema()', assert => {
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
  const actual = setContentSchema(route, rootContent, schemaObj)
  const expected = 'sent'

  assert.equal(actual, expected,
    `If schemaObj has different keys from current pageContent,
    setContentSchema() should call sendPageContent once`)

  /* -------------------- */

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
  const actual2 = setContentSchema(route, rootContent2, schemaObj2)
  const expected2 = 'not sent'

  assert.equal(actual2, expected2,
    `If schemaObj and pageContent are identical (not the same object, but
    same attributes and values), sendPageContent() should NOT be called`)

  assert.end()
})
