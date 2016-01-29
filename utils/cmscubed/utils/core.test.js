import test from 'tape'
import {
  convertQueryToPathArray,
  convertPathArrayToRoute,
  convertRouteToPathArray,
  diffC3ObjKeysForAdding,
  diffC3ObjKeysForRemoving,
  convertContentToC3Obj,
  convertC3ObjToContent,
  getPageContent,
  createRouteTree,
  addPageContentToRootContent,
  getContentKeysToAdd,
  getContentKeysToRemove
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

test('convertContentToC3Obj()', assert => {
  const route = '/products/pro'
  const content = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
    },
    products: {
      heading: 'Products heading',
      pro: {
        heading: 'Pro heading'
      }
    }
  }
  const actual = convertContentToC3Obj(route, content)
  const expected = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
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

  assert.deepEqual(actual, expected,
    `Given a route string and content object, convertContentToC3Obj() should
    output a c3 object with $type: "route" for even if the pageContent is a
    nested route`)

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
      heading: 'About heading',
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
      hacker: {
        $type: 'route',
        heading: 'Hacker heading',
        text: 'Hacker text'
      }
    }
  }
  const actual = getPageContent(route, rootC3Obj)
  const expected = {
    heading: 'Hacker heading',
    text: 'Hacker text'
  }

  assert.deepEqual(actual, expected,
    `Given a route string and rootC3Obj object, getPageContent() should
    output pageContent object`)

  /* -------------------- */

  const route2 = '/'
  const actual2 = getPageContent(route2, rootC3Obj)
  const expected2 = {
    heading: 'Home heading',
    about: {
      heading: 'About heading'
    },
    products: {
      heading: 'Products heading',
      hacker: {
        heading: 'Hacker heading',
        text: 'Hacker text'
      }
    }
  }

  assert.deepEqual(actual2, expected2,
    `Given a root route, getPageContent() should output rootContent object
    without {$type: route}`)

  assert.end()
})

test('createRouteTree()', assert => {
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
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
  const actual = createRouteTree(rootC3Obj)
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
    `Given a root c3Obj, createRouteTree() should output a tree of all routes`)

  /* -------------------- */

  const rootC3Obj2 = {
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
    },
    products: {
      $type: 'route',
      heading: 'Products heading',
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
  const actual2 = createRouteTree(rootC3Obj2)
  const expected2 = []

  assert.deepEqual(actual2, expected2,
    `Given a root c3Obj with missing root route, createRouteTree() should output
    an empty array`)

  assert.end()
})

test('addPageContentToRootContent()', assert => {
  const rootContent = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading',
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
      heading: 'About heading',
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
      heading: 'About heading',
    }
  }
  const actual2 = addPageContentToRootContent(route, rootContent2, pageContent)
  const expected2 = {
    $type: 'route',
    about: {
      $type: 'route',
      heading: 'About heading',
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
  const route = ['products']
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
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
      heading: 'About heading',
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

  assert.end()
})

test('getContentKeysToRemove()', assert => {
  const route = ['products']
  const rootC3Obj = {
    $type: 'route',
    heading: 'Home heading',
    about: {
      $type: 'route',
      heading: 'About heading',
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
      heading: 'About heading',
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
