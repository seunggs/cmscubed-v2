import test from 'tape'
import sinon from 'sinon'
import {
  convertRouteToPathArray,
  createPreviewDomain,
  getPageContent,
  getProjectRoute,
  createRouteTree,
  isValidLocale,
  convertDBContentObjsToContent
} from './content'

test('convertRouteToPathArray()', assert => {
  const route = '/products/pro/overview'
  const actual = convertRouteToPathArray(route)
  const expected = ['products', 'pro', 'overview']

  assert.deepEqual(actual, expected,
    `Given a route string, convertRouteToPathArray() should output a path array`)

  assert.end()
})

test('createPreviewDomain()', assert => {
  const domain = 'https://www.blah.com'
  const env = 'staging'
  const tld = 'com'
  const actual = createPreviewDomain(domain, env, tld)
  const expected = 'c3-www-blah-preview-staging-com.surge.sh'

  assert.equal(actual, expected,
    `Given a domain and env, createPreviewDomain() should return a preview
    url consisting of prefix, subdomain, domain, and env`)

  assert.end()
})

test('getProjectRoute()', assert => {
  const route = '/edit/project/route'
  const actual = getProjectRoute(route)
  const expected = '/project/route'

  assert.equal(actual, expected,
    `Given cmscubed website route, getProjectRoute() should return the project
    route`)

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
