import { assert } from 'vitest'
import { describe } from 'vitest'

import { unslugify } from './unslugify'

describe('Slugify a given string', () => {
  it('should replace dashes with spaces', () => {
    const result = unslugify('smart-contracts-activity-tab')
    assert.equal(result, 'Smart Contracts Activity Tab')
  })

  it('should camel case all characters separated by a dash', () => {
    const result = unslugify('Smart-CONtracts-1')
    assert.equal(result, 'Smart Contracts 1')
  })

  it('should preserve any symbols in the string', () => {
    const result = unslugify('$smArT-CONt^%#()ractS')
    assert.equal(result, '$Smart Cont^%#()racts')
  })
})
