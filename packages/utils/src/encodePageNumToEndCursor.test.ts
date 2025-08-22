import { assert, describe } from 'vitest'

import { encodePageNumToEndCursor } from './encodePageNumToEndCursor'

const decode = (cursor: string) => {
  let decoded = ''
  const buffer = Buffer.from(cursor, 'base64')
  for (let i = 0; i < buffer.length; i++) {
    decoded += String.fromCharCode(buffer[i])
  }
  return decoded
}

describe('Encode Page Number to End Cursor String', () => {
  it('should, given no page parameter and a limit of 20, return a skip of 0', () => {
    const result = encodePageNumToEndCursor(20, '')
    let decoded = decode(result)
    assert.equal(decoded, '{"skip":0}')
  })

  it('should, given a page of 2 and a limit of 20, return a skip of 20', () => {
    const result = encodePageNumToEndCursor(20, '2')
    let decoded = decode(result)
    assert.equal(decoded, '{"skip":20}')
  })

  it('should, given a page of 3 and a limit of 20, return a skip of 40', () => {
    const result = encodePageNumToEndCursor(20, '3')
    let decoded = decode(result)
    assert.equal(decoded, '{"skip":40}')
  })

  it('should, given a page of 8 and a limit of 4, return a skip of 32', () => {
    const result = encodePageNumToEndCursor(4, '8')
    let decoded = decode(result)
    assert.equal(decoded, '{"skip":28}')
  })
})
