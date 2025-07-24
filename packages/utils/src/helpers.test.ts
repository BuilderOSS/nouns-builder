import { assert } from 'vitest'

import { formatDate, unpackOptionalArray } from './helpers'

it('should format the date as a readable string', () => {
  const result = formatDate(new Date(2022, 11, 5), true)
  assert.equal(result, '12/05/2022')
})

it('should format the date as a readable string', () => {
  const result = formatDate('2022-12-05', true)
  assert.equal(result, '12/05/2022')
})

it('should format the date as a non-readable string', () => {
  const result = formatDate(new Date(2022, 11, 5), false)
  assert.equal(result, '2022-12-05')
})

it('should format the date as a non-readable string', () => {
  const result = formatDate('2022-12-05', false)
  assert.equal(result, '2022-12-05')
})

// without readable arg - default is false
it('should format the date as a non-readable string', () => {
  const result = formatDate('2022-12-05')
  assert.equal(result, '2022-12-05')
})

describe('unpackOptionalArray', () => {
  it('should return the array if it is defined', () => {
    const array = [1, 'text', { id: '0x1234' }]

    expect(unpackOptionalArray(array, 3)).toEqual(array)
  })

  it('should return an array of unefineds if the array is undefined', () => {
    expect(unpackOptionalArray(undefined, 3)).toEqual([undefined, undefined, undefined])
  })
})
