const { validateArgs } = require('../util/ArgsValidator')


describe('validating arguments length', () => {
  function testArgsLength(a, b) {
    validateArgs(['*', '*'], arguments) 
  }
  test('rejects if too few arguments', () => {
    const testFunction = () => {
      testArgsLength(5)
    }
    expect(testFunction).toThrowError('Unexpected arguments length')
  })
  test('rejects if too many arguments', () => {
    const testFunction = () => {
      testArgsLength(5, 6, 7)
    }
    expect(testFunction).toThrowError('Unexpected arguments length')
  })
  test('passes with correct arguments length', () => {
    const testFunction = () => {
      testArgsLength(5, 6)
    }
    expect(testFunction).not.toThrow()
  })
  test('passes with correct arguments length (counts undefined and null) ', () => {
    const testFunction = () => {
      testArgsLength(undefined, null)
    }
    expect(testFunction).not.toThrow()
  })
})


describe('validating argument types', () => {
  function testArgsType(a, b, c) {
    validateArgs(['String', 'Number', 'Array'], arguments)
    return 
  }
  test('rejects if an argument contains incorrect type', () => {
    const testFunction = () => {
      testArgsType('x', 'y', [])
    }
    expect(testFunction).toThrowError('Unexpected argument type at arguments index 1')
  })
  test('rejects if an argument contains incorrect type', () => {
    const testFunction = () => {
      testArgsType('x', 9, 3)
    }
    expect(testFunction).toThrowError('Unexpected argument type at arguments index 2')
  })
  test('passes if all arguments are the correct types', () => {
    const testFunction = () => {
      testArgsType('x', 5, [])
    }
    expect(testFunction).not.toThrow()
  })
})