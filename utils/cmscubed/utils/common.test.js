import test from 'tape'
import {
  convertQueryToPath,
  convertPathToRoute,
  convertRouteToPath,
  convertObjToC3Obj
} from './common'

test('convertPathToRoute()', assert => {
  const path = ['products', 'pro', 'overview']
  const actual = convertPathToRoute(path)
  const expected = '/products/pro/overview'

  assert.equal(actual, expected,
    `Given a path array, convertPathToRoute() should output a route`)

  assert.end()
})

test('convertRouteToPath()', assert => {
  const route = '/products/pro/overview'
  const actual = convertRouteToPath(route)
  const expected = ['products', 'pro', 'overview']

  assert.deepEqual(actual, expected,
    `Given a route string, convertRouteToPath() should output a path array`)

  assert.end()
})

test('convertObjToC3Obj()', assert => {
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
  const actual = convertObjToC3Obj(route, pageContent)
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
        $type: 'route',
        heading: 'Pro heading',
        subContent: {
          text: 'Pro sub content'
        }
      }
    }
  }

  assert.deepEqual(actual, expected,
    `Given a route string and pageContent object, convertObjToC3Obj() should output
     a c3 object with $type: "route" for only route nodes`)

  assert.end()
})
