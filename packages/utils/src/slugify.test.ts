import { assert } from 'vitest'
import { describe } from 'vitest'

import { slugify } from './slugify'

describe('Slugify a given string', () => {
  it('should remove spaces from a string and replace with - ', () => {
    const result = slugify('Smart     Contracts')
    assert.equal(result, 'smart-contracts')
  })

  it('should lowercase all characters', () => {
    const result = slugify('SmArT CONTractS')
    assert.equal(result, 'smart-contracts')
  })

  it('should remove any symbols', () => {
    const result = slugify('$smArT CONt^%#()ractS')
    assert.equal(result, 'smart-contracts')
  })
})
