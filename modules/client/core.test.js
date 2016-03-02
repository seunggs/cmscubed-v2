import 'leaked-handles'
import test from 'tape'
import {
  getCurrentDomain,
  checkIsLocalEnv,
  sanitizeRoute,
  convertEnvToShortEnv,
  createEncodedQueryStr,
  checkIsInteger,
  checkIsObjectifiedArray,
  deepKeysEqual,
  deepCopyValues,
  getUpdatedPageContentFromSchemaChange,
  createContentUpdateObj,
  getPageContent,
  replaceContentSchemaValuesWithPlaceholders,
  deepObjectifyArrays,
  deepDeobjectifyArrays,
  // IMPURE
  updatePageContentOnSchemaChange
} from './core'

test('getCurrentDomain()', assert => {
  const mockLocationObj = {
    hostname: '127.0.0.1',
    port: '4000'
  }
  const actual = getCurrentDomain(mockLocationObj)
  const expected = '127.0.0.1:4000'

  assert.equal(actual, expected,
    `Given a window.location object, getCurrentDomain() should return
    current domain, including port if any`)

  /* -------------------- */

  const mockLocationObj2 = {
    hostname: 'www.cmscubed-test.com',
    port: null
  }
  const actual2 = getCurrentDomain(mockLocationObj2)
  const expected2 = 'www.cmscubed-test.com'

  assert.equal(actual2, expected2,
    `Given a window.location object, getCurrentDomain() should return
    current domain, including port if any`)

  assert.end()
})

test('checkIsLocalEnv()', assert => {
  const domain = '127.0.0.1:4000'
  const actual = checkIsLocalEnv(domain)
  const expected = true

  assert.equal(actual, expected,
    `Given a domain, checkIsLocalEnv() should return true if domain is local`)

  /* -------------------- */

  const domain2 = 'cmscubed-test.com'
  const actual2 = checkIsLocalEnv(domain2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `Given a domain, checkIsLocalEnv() should return false if domain is not local`)

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

test('convertEnvToShortEnv()', assert => {
  const env = 'stagingDomain'
  const actual = convertEnvToShortEnv(env)
  const expected = 'staging'

  assert.equal(actual, expected,
    `Given an env string with 'Domain', convertEnvToShortEnv() should
    return an env string without 'Domain' in lowercase`)

  /* -------------------- */

  const env2 = 'prod'
  const actual2 = convertEnvToShortEnv(env2)
  const expected2 = 'prod'

  assert.equal(actual2, expected2,
    `Given an env string without 'Domain', convertEnvToShortEnv() should return
    the original env string`)

  assert.end()
})

test('createEncodedQueryStr()', assert => {
  const projectDomain = 'test.com'
  const env = 'staging'
  const locale = 'en-US'
  const route = '/products/pro'
  const queryArray = [{projectDomain}, {env}, {locale}, {route}]
  const actual = createEncodedQueryStr(queryArray)
  const expected = 'projectDomain=test.com&env=staging&locale=en-US&route=%2Fproducts%2Fpro'

  assert.equal(actual, expected,
    `Given an array of variables, createEncodedQueryStr() should create a query
    string such as var1Name=encodedVar1Value&var2Name=encodedVar2Value`)

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

test('checkIsObjectifiedArray()', assert => {
  const obj = {
    0: {
      d: 'x',
      e: 'y'
    },
    1: {
      a: 'k'
    }
  }
  const actual = checkIsObjectifiedArray(obj)
  const expected = true

  assert.deepEqual(actual, expected,
    `Given an objectified array, checkIsObjectifiedArray() returns true`)

  /* -------------------- */

  const obj2 = {
    a: {
      0: 'x',
      1: 'y'
    },
    b: {
      a: 'k'
    }
  }
  const actual2 = checkIsObjectifiedArray(obj2)
  const expected2 = false

  assert.deepEqual(actual2, expected2,
    `Given a regular object, checkIsObjectifiedArray() returns false even if
    it contains objectified array`)

  /* -------------------- */

  const obj3 = 'a'
  const actual3 = checkIsObjectifiedArray(obj3)
  const expected3 = false

  assert.deepEqual(actual3, expected3,
    `Given a primitive, checkIsObjectifiedArray() returns false`)

  /* -------------------- */

  const obj4 = ['a']
  const actual4 = checkIsObjectifiedArray(obj4)
  const expected4 = false

  assert.deepEqual(actual4, expected4,
    `Given an array, checkIsObjectifiedArray() returns false`)

  assert.end()
})

test('deepKeysEqual()', assert => {
  const objA = {
    a: {
      x: {
        d: 'd',
        e: ['e1'],
        f: {
          g: 'g'
        }
      },
      y: ['y1', 'y2']
    },
    b: ['b1', 'b2'],
    c: 'c'
  }
  const objB = {
    b: ['b1', 'b2'],
    a: {
      x: {
        e: ['e1'],
        f: {
          g: 'g'
        },
        d: 'd'
      },
      y: ['y1', 'y2']
    },
    c: 'c'
  }
  const actual = deepKeysEqual(objA, objB)
  const expected = true

  assert.equal(actual, expected,
    `Given two objects with same keys (in all depths) even with different
    order, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA2 = {
    a: {
      x: {
        d: 'd',
        e: [
          'e1',
        ],
        f: {
          g: 'g'
        }
      },
    }
  }
  const objB2 = {
    a: {
      x: {
        e: [
          'e1',
        ],
        f: {
          g: 'g'
        },
        different: 'different key!'
      }
    }
  }
  const actual2 = deepKeysEqual(objA2, objB2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `#2: Given two objects with different keys (in any depth), deepKeysEqual()
    should return false`)

  /* -------------------- */

  const objA3 = {
    a: {
      x: {
        e: ['e1', 'e2'],
        f: {
          g: 'g'
        }
      },
    },
    b: ['b1', 'b2']
  }
  const objB3 = {
    b: ['b1', 'b2'],
    a: {
      x: {
        e: ['e1', 'e2'],
        f: {
          g: 'Some different value!'
        }
      },
    }
  }
  const actual3 = deepKeysEqual(objA3, objB3)
  const expected3 = true

  assert.equal(actual3, expected3,
    `#3: Given two objects with same keys (in all depths) but with different
    values, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA4 = {
    a: {
      y: {
        0: 'y1',
        1: 'y2'
      }
    },
    b: ['b1', 'b2'],
    c: 'c'
  }
  const objB4 = {
    b: ['b1', 'b2'],
    a: {
      y: ['y1', 'y2']
    },
    c: 'c'
  }
  const actual4 = deepKeysEqual(objA4, objB4)
  const expected4 = true

  assert.equal(actual4, expected4,
    `#4: Given an object with arrays and another object with objectified form of
    same arrays, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA5 = {
    b: ['b1', 'b2']
  }
  const objB5 = {
    b: ['b1', 'b2', 'b3']
  }
  const actual5 = deepKeysEqual(objA5, objB5)
  const expected5 = true

  assert.equal(actual5, expected5,
    `#5: If the arrays are different, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA6 = {
    a: {
      y: {
        0: 'y1'
      }
    }
  }
  const objB6 = {
    a: {
      y: {
        0: 'y1',
        1: 'y2'
      }
    }
  }
  const actual6 = deepKeysEqual(objA6, objB6)
  const expected6 = true

  assert.equal(actual6, expected6,
    `#6: If objectified arrays are different, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA7 = {
    a: {
      0: 'x'
    }
  }
  const objB7 = {
    a: {
      0: {
        0: 'y'
      }
    }
  }
  const actual7 = deepKeysEqual(objA7, objB7)
  const expected7 = false

  assert.equal(actual7, expected7,
    `#7: If nested objectified arrays have different depth, deepKeysEqual()
    should return false`)

  /* -------------------- */

  const objA8 = {
    a: {
      0: {
        0: 'x'
      }
    }
  }
  const objB8 = {
    a: {
      0: {
        0: 'x',
        1: 'y'
      }
    }
  }
  const actual8 = deepKeysEqual(objA8, objB8)
  const expected8 = true

  assert.equal(actual8, expected8,
    `#8: If nested objectified arrays have different values, deepKeysEqual()
    should return true`)

  /* -------------------- */

  const objA9 = {
    a: {
      0: {
        b: {
          0: 'c'
        }
      }
    }
  }
  const objB9 = {
    a: {
      0: {
        b: {
          0: 'c',
          1: 'd'
        }
      }
    }
  }
  const actual9 = deepKeysEqual(objA9, objB9)
  const expected9 = true

  assert.equal(actual9, expected9,
    `#9: If nested objectified arrays have different values, deepKeysEqual()
    should return true`)

  /* -------------------- */

  const objA10 = {
    a: {
      0: {
        b: {
          0: 'c'
        }
      }
    }
  }
  const objB10 = {
    a: {
      0: {
        b: {
          0: 'c',
        }
      },
      1: 'a'
    }
  }
  const actual10 = deepKeysEqual(objA10, objB10)
  const expected10 = true

  assert.equal(actual10, expected10,
    `#10: If nested objectified arrays have different values, deepKeysEqual()
    should return true`)

  /* -------------------- */

  const objA11 = {
    a: {
      0: {
        b: {
          0: 'c'
        }
      }
    }
  }
  const objB11 = {
    a: {
      0: {
        b: {
          0: 'c',
        }
      },
      1: {
        x: 'x'
      }
    }
  }
  const actual11 = deepKeysEqual(objA11, objB11)
  const expected11 = true

  assert.equal(actual11, expected11,
    `#11: If nested objectified arrays have different values that do not
    contain objects or arrays, deepKeysEqual() should return true`)

  /* -------------------- */

  const objA12 = {
    a: {
      0: {
        b: {
          0: 'c'
        }
      }
    }
  }
  const objB12 = {
    a: {
      0: {
        b: {
          0: 'c',
        }
      },
      1: {
        0: 'x'
      }
    }
  }
  const actual12 = deepKeysEqual(objA12, objB12)
  const expected12 = false

  assert.equal(actual12, expected12,
    `#12: If nested objectified arrays have different values that contains objects
    or arrays, deepKeysEqual() should return false`)

  assert.end()
})

test('deepCopyValues()', assert => {
  const fromObj = {
    heading: 'Old heading',
    text: 'Home text',
    list: {
      0: 'old list',
      1: {
        item2: 'item 2',
        sublist: {
          0: 'sub list item',
          1: 'another sub list item'
        }
      },
      2: 'new list item'
    },
    secondList: {
      0: 'zero'
    },
    thirdList: {
      0: 'third'
    },
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
      {
        newItem: 'new item',
        sublist: {
          0: 'sub list item'
        }
      }
    ],
    secondList: {
      0: 'zero',
      1: 'one'
    },
    thirdList: ['third'],
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
    list: {
      0: 'old list',
      1: {
        newItem: 'new item',
        sublist: {
          0: 'sub list item',
          1: 'another sub list item'
        }
      },
      2: 'new list item'
    },
    secondList: {
      0: 'zero'
    },
    thirdList: {
      0: 'third'
    },
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

  /* -------------------- */

  const currentPageContent3 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const newSchemaObj3 = {
    heading: 'Changed heading',
    list: ['new list', 'item 2'],
    benefits: {
      pro: 'Pro benefits',
      hacker: 'Hacker benefits',
      anotherAddedKey: 'Something else'
    }
  }
  const actual3 = getUpdatedPageContentFromSchemaChange(currentPageContent3, newSchemaObj3)
  const expected3 = null

  assert.deepEqual(actual3, expected3,
    `getUpdatedPageContentFromSchemaChange() should return null if
    contentSchema hasn't changed`)

  assert.end()
})

test('createContentUpdateObj()', assert => {
  const projectDomain = 'test.com'
  const env = 'staging'
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
    `Given no matching route, getPageContent() should return undefined`)

  /* -------------------- */

  const route3 = '/products/pro'
  const rootContent3 = undefined
  const actual3 = getPageContent(route3, rootContent3)
  const expected3 = undefined

  assert.deepEqual(actual3, expected3,
    `Given an undefined rootContent, getPageContent() should return undefined`)

  assert.end()
})

test('replaceContentSchemaValuesWithPlaceholders()', assert => {
  const contentPlaceholderChar = '-'
  const contentSchema = {
    heading: 'Heading',
    benefits: [
      {
        first: 'Benefit 1'
      },
      {
        second: ['Second 1', 'Second 2']
      },
    ],
    sub: {
      heading: 'Sub heading',
      list: ['a', 'b', 'c']
    }
  }
  const actual = replaceContentSchemaValuesWithPlaceholders(contentPlaceholderChar, contentSchema)
  const expected = {
    heading: '-------',
    benefits: [
      {
        first: '---------'
      },
      {
        second: ['--------', '--------']
      },
    ],
    sub: {
      heading: '-----------',
      list: ['-', '-', '-']
    }
  }

  assert.deepEqual(actual, expected,
    `Given contentSchema, replaceContentSchemaValuesWithPlaceholders() should
    return all values replaced with placeholder character`)

  assert.end()
})

test('deepObjectifyArrays()', assert => {
  const schemaObj = {
    heading: 'Heading',
    text: 'Text',
    list: ['a', 'b'],
    sub: {
      c: [
        {d: 'd'},
        {
          e: ['e']
        }
      ]
    }
  }
  const actual = deepObjectifyArrays(schemaObj)
  const expected = {
    heading: 'Heading',
    text: 'Text',
    list: {
      0: 'a',
      1: 'b'
    },
    sub: {
      c: {
        0: {d: 'd'},
        1: {
          e: {0: 'e'}
        }
      }
    }
  }

  assert.deepEqual(actual, expected,
    `Given an object containing arrays, deepObjectifyArrays() should convert
    all arrays to objectified arrays`)

  assert.end()
})

test('deepDeobjectifyArrays()', assert => {
  const pageContent = {
    heading: 'Heading',
    text: 'Text',
    list: {
      0: 'item 1',
      1: 'item 2'
    },
    subContent: {
      heading: 'Sub Heading',
      text: 'Sub Text',
      list: {
        0: 'sub item 1',
        1: {
          listsub: 'sub item 2',
          listInsideObjInsideList: {
            0: 'a',
            1: 'b'
          }
        }
      }
    }
  }
  const actual = deepDeobjectifyArrays(pageContent)
  const expected = {
    heading: 'Heading',
    text: 'Text',
    list: ['item 1', 'item 2'],
    subContent: {
      heading: 'Sub Heading',
      text: 'Sub Text',
      list: [
        'sub item 1',
        {
          listsub: 'sub item 2',
          listInsideObjInsideList: ['a', 'b']
        }
      ]
    }
  }

  assert.deepEqual(actual, expected,
    `Given an object that contain objectified arrays, deepDeobjectifyArrays()
    should convert all objectified arrays to real arrays (at all depth)`)

  assert.end()
})

/* --- IMPURE --------------------------------------------------------------- */

test('updatePageContentOnSchemaChange()', assert => {
  const localStorageMock = {
    getItem(key) { return },
    setItem(key, value) { return }
  }
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
  const actual = updatePageContentOnSchemaChange(localStorageMock, route, rootContent, schemaObj)
  const expected = true

  assert.equal(actual, expected,
    `If schemaObj has different keys from current pageContent,
    updatePageContentOnSchemaChange() should return true`)

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
  const actual2 = updatePageContentOnSchemaChange(localStorageMock, route2, rootContent2, schemaObj2)
  const expected2 = false

  assert.equal(actual2, expected2,
    `If schemaObj and pageContent are identical (not the same object, but
    same attributes and values), updatePageContentOnSchemaChange() should
    return false`)

  /* -------------------- */

  const route3 = '/products'
  const rootContent3 = undefined
  const schemaObj3 = {
    heading: 'Products heading'
  }
  const actual3 = updatePageContentOnSchemaChange(localStorageMock, route3, rootContent3, schemaObj3)
  const expected3 = false

  assert.equal(actual3, expected3,
    `If rootContent supplied is nil, sendPageContent() should return false`)

  assert.end()
})
