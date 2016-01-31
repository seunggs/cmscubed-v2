import test from 'tape'
import {
  convertQueryToPathArray,
  convertPathArrayToRoute,
  convertRouteToPathArray,
  sanitizeRoute,
  deepCopyValues,
  getUpdatedPageContentFromSchemaChange,
  // diffC3ObjKeysForAdding,
  // diffC3ObjKeysForRemoving,
  getPageContent,
  createRouteTree,
  // addPageContentToRootContent,
  // getContentKeysToAdd,
  // getContentKeysToRemove,
  isRouteTuple,
  addKeysToC3Obj
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

test('diffC3ObjKeysForAdding()', assert => {
  const pathArray = []
  const oldObj = {
    $type: 'route',
    heading: 'Home heading',
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const newObj = {
    $type: 'route',
    heading: 'Home heading',
    text: 'Home text',
    products: {
      $type: 'route',
      heading: 'Products heading',
      hacker: {
        $type: 'route',
        heading: 'Hacker heading'
      },
      pro: {
        $type: 'route',
        heading: 'Pro heading',
        benefits: {
          heading: 'Benefits heading',
          list: ['benefit1', 'benefit2']
        }
      }
    }
  }
  const actual = diffC3ObjKeysForAdding(pathArray, oldObj, newObj)
  const expected = [
    [['text'], 'Home text'],
    [['products', 'hacker'], { $type: 'route', heading: 'Hacker heading' }],
    [['products', 'pro', 'benefits'], { heading: 'Benefits heading', list: ['benefit1', 'benefit2'] }]
  ]

  assert.deepEqual(actual, expected,
    `Given an old c3Obj and a new c3Obj, diffC3ObjKeysForAdding() should output
    an array of tuples (i.e. [pathArray, value]) for all new object keys that
    differ from old object AND need to be added`)

  /* -------------------- */

  const oldObj2 = {
    $type: 'route',
    heading: 'Home heading',
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const newObj2 = {
    $type: 'route',
    heading: 'Home heading',
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const actual2 = diffC3ObjKeysForAdding(pathArray, oldObj2, newObj2)
  const expected2 = []

  assert.deepEqual(actual2, expected2,
    `If the old c3Obj and the new c3Obj is identical, diffC3ObjKeysForAdding()
    should return an empty array`)

  /* -------------------- */

  const oldObj3 = {
    $type: 'route',
    heading: 'Home heading'
  }
  const newObj3 = {
    $type: 'route',
    heading: 'Some other heading'
  }
  const actual3 = diffC3ObjKeysForAdding(pathArray, oldObj3, newObj3)
  const expected3 = []

  assert.deepEqual(actual2, expected2,
    `Value change should not affect the diff outcome`)

  assert.end()
})

test('diffC3ObjKeysForRemoving()', assert => {
  const pathArray = []
  const oldObj = {
    $type: 'route',
    heading: 'Home heading',
    text: 'Home text',
    products: {
      $type: 'route',
      heading: 'Products heading',
      news: {
        heading: 'News heading',
        subnews: {
          heading: 'Subnews heading'
        }
      },
      hacker: {
        $type: 'route',
        heading: 'Hacker heading'
      },
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const newObj = {
    $type: 'route',
    heading: 'Home heading',
    products: {
      $type: 'route',
      heading: 'Products heading',
      pro: {
        $type: 'route',
        heading: 'Pro heading',
        benefits: {
          heading: 'Benefits heading',
          list: ['benefit1', 'benefit2']
        }
      }
    }
  }
  const actual = diffC3ObjKeysForRemoving(pathArray, oldObj, newObj)
  const expected = [
    [['text'], 'Home text'],
    [['products', 'news'], { heading: 'News heading', subnews: { heading: 'Subnews heading' } }],
    [['products', 'hacker'], { $type: 'route', heading: 'Hacker heading' }]
  ]

  assert.deepEqual(actual, expected,
    `Given an old c3Obj and a new c3Obj, diffC3ObjKeysForRemoving() should
    output an array of tuples (i.e. [pathArray, value]) for all new object keys
    that differ from old object AND need to be removed`)

  assert.end()
})

test('convertC3ObjToContent()', assert => {
  const content = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const actual = convertC3ObjToContent(content)
  const expected = {
    heading: 'Home heading',
    about: {
      heading: 'About heading'
    },
    products: {
      heading: 'Products heading',
      pro: {
        heading: 'Pro heading'
      }
    }
  }

  assert.deepEqual(actual, expected,
    `Given a c3 object, convertC3ObjToContent() should output a content object
    without any $type: "route" in any depth`)

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
    "/": {
      heading: 'Home heading'
    },
    "/about": {
      heading: 'About heading'
    },
    "/products": {
      heading: 'Products heading'
    },
    "/products/hacker": {
      heading: 'Hacker heading',
    },
    "/products/pro": {
      heading: 'Pro heading',
    }
  }
  const actual = createRouteTree(rootContent)
  const expected = [
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

test('addPageContentToRootContent()', assert => {
  const rootContent = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      hacker: {
        $type: 'route',
        heading: 'Hacker heading'
      }
    }
  }
  const route = '/products/pro'
  const pageContent = {
    heading: 'Pro heading',
    subContent: {
      text: 'Pro sub content'
    }
  }
  const actual = addPageContentToRootContent(route, rootContent, pageContent)
  const expected = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      hacker: {
        $type: 'route',
        heading: 'Hacker heading'
      },
      pro: {
        heading: 'Pro heading',
        subContent: {
          text: 'Pro sub content'
        }
      }
    }
  }

  assert.deepEqual(actual, expected,
    `Given a route string and pageContent object, addPageContentToRootContent() should
    output a rootContent`)

  /* -------------------- */

  const rootContent2 = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading'
    }
  }
  const actual2 = addPageContentToRootContent(route, rootContent2, pageContent)
  const expected2 = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      pro: {
        heading: 'Pro heading',
        subContent: {
          text: 'Pro sub content'
        }
      }
    }
  }

  assert.deepEqual(actual2, expected2,
    `Given a route string and pageContent object, addPageContentToRootContent() should
    output a root content even if the pageContent is a nested route`)

  assert.end()
})

test('getContentKeysToAdd()', assert => {
  const route = '/products'
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    }
  }
  const schemaObj = {
    heading: 'Products heading'
  }
  const actual = getContentKeysToAdd(route, rootC3Obj, schemaObj)
  const expected = [
    [['products'], { $type: 'route', heading: 'Products heading' }]
  ]

  assert.deepEqual(actual, expected,
    `getContentKeysToAdd() should output an array of tuples
    (i.e. [pathArray, value]) that needs to be added to the rootC3Obj AND add
    {$type: 'route'} to the root of the schemaObj if the page content doesn't
    yet exist`)

  /* -------------------- */

  const rootC3Obj2 = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading'
    }
  }
  const schemaObj2 = {
    heading: 'Products heading',
    text: 'Products text'
  }
  const actual2 = getContentKeysToAdd(route, rootC3Obj2, schemaObj2)
  const expected2 = [
    [['products', 'text'], 'Products text']
  ]

  assert.deepEqual(actual2, expected2,
    `getContentKeysToAdd() should output an array of tuples
    (i.e. [pathArray, value]) that needs to be updated in the rootC3Obj if the
    page content already exists`)

  /* -------------------- */

  const route3 = '/products/pro'
  const rootC3Obj3 = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      }
    }
  }
  const schemaObj3 = {
    heading: 'Pro heading',
    text: 'Pro text'
  }
  const actual3 = getContentKeysToAdd(route3, rootC3Obj3, schemaObj3)
  const expected3 = [
    [['products', 'pro', 'text'], 'Pro text']
  ]

  assert.deepEqual(actual3, expected3,
    `getContentKeysToAdd() should output the right pathArray even with nested
    routes`)

  assert.end()
})

test('getContentKeysToRemove()', assert => {
  const route = '/products'
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    }
  }
  const schemaObj = {
    heading: 'Products heading'
  }
  const actual = getContentKeysToRemove(route, rootC3Obj, schemaObj)
  const expected = null

  assert.deepEqual(actual, expected,
    `getContentKeysToRemove() should output null if the page content doesn't
    yet exist`)

  /* -------------------- */

  const rootC3Obj2 = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text'
    }
  }
  const schemaObj2 = {
    heading: 'Products heading'
  }
  const actual2 = getContentKeysToRemove(route, rootC3Obj2, schemaObj2)
  const expected2 = [
    [['products', 'text'], 'Products text']
  ]

  assert.deepEqual(actual2, expected2,
    `getContentKeysToRemove() should output an array of tuples
    (i.e. [pathArray, value]) that needs to be removed from the rootC3Obj if
    the page content already exists`)

  assert.end()
})

test('isRouteTuple()', assert => {
  const tuple = [['products', 'pro'], { $type: 'route', heading: 'Pro heading' }]
  const actual = isRouteTuple(tuple)
  const expected = true

  assert.deepEqual(actual, expected,
    `Given a tuple (i.e. [pathArray, c3ObjValue]) for content key update,
    isRouteTuple() should output true if c3ObjValue contains {$type: 'route'}`)

  /* -------------------- */

  const tuple2 = [['products', 'sub'], { text: 'Products sub' }]
  const actual2 = isRouteTuple(tuple2)
  const expected2 = false

  assert.deepEqual(actual2, expected2,
    `Given a tuple (i.e. [pathArray, c3ObjValue]) for content key update,
    isRouteTuple() should output false if c3ObjValue does not contain
    {$type: 'route'}`)

  assert.end()
})

test('addKeysToC3Obj()', assert => {
  const keysToAdd = [
    [['products', 'benefits'], ['Pro benefit 1', 'Pro benefit 2']],
    [['products', 'pro'], { $type: 'route', heading: 'Pro heading' }]
  ]
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text'
    }
  }
  const actual = addKeysToC3Obj(keysToAdd, rootC3Obj)
  const expected = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading'
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
      text: 'Products text',
      pro: {
        $type: 'route',
        heading: 'Pro heading'
      },
      benefits: [
        'Pro benefit 1',
        'Pro benefit 2'
      ]
    }
  }

  assert.deepEqual(actual, expected,
    `Given an array of tuples (i.e. [pathArray, value]) and c3Obj,
    addKeysToC3Obj() should return a new rootC3Obj with added keys`)

  assert.end()
})
