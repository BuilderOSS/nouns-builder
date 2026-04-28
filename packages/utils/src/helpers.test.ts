import { assert } from 'vitest'

import { compareAndReturn, formatDate, unpackOptionalArray } from './helpers'

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

describe('compareAndReturn', () => {
  it('returns no updates when values are deeply equal', () => {
    const initialValues = {
      daoLinks: [
        { key: 'website', url: 'https://builder.xyz' },
        { key: 'twitter', url: 'https://x.com/builder' },
      ],
      votingDelay: { days: 0, hours: 0, minutes: 5, seconds: 0 },
    }

    const values = {
      daoLinks: [
        { key: 'website', url: 'https://builder.xyz' },
        { key: 'twitter', url: 'https://x.com/builder' },
      ],
      votingDelay: { days: 0, hours: 0, minutes: 5, seconds: 0 },
    }

    expect(compareAndReturn(initialValues, values)).toEqual([])
  })

  it('returns one update when nested array object values change', () => {
    const initialValues = {
      daoLinks: [{ key: 'website', url: 'https://builder.xyz' }],
      daoWebsite: 'https://builder.xyz',
    }

    const values = {
      daoLinks: [{ key: 'website', url: 'https://builder.dev' }],
      daoWebsite: 'https://builder.xyz',
    }

    expect(compareAndReturn(initialValues, values)).toEqual([
      {
        field: 'daoLinks',
        value: [{ key: 'website', url: 'https://builder.dev' }],
      },
    ])
  })

  it('returns one update per changed top-level field', () => {
    const initialValues = {
      daoLinks: [{ key: 'website', url: 'https://builder.xyz' }],
      founderAllocation: [{ founderAddress: '0xabc', allocationPercentage: 10 }],
      proposalThreshold: 5,
    }

    const values = {
      daoLinks: [{ key: 'website', url: 'https://builder.dev' }],
      founderAllocation: [{ founderAddress: '0xabc', allocationPercentage: 20 }],
      proposalThreshold: 6,
    }

    const updates = compareAndReturn(initialValues, values)

    expect(updates).toHaveLength(3)
    expect(updates).toEqual([
      {
        field: 'daoLinks',
        value: [{ key: 'website', url: 'https://builder.dev' }],
      },
      {
        field: 'founderAllocation',
        value: [{ founderAddress: '0xabc', allocationPercentage: 20 }],
      },
      {
        field: 'proposalThreshold',
        value: 6,
      },
    ])
  })

  it('returns a change when an item is added to nested arrays', () => {
    const initialValues = {
      daoLinks: [{ key: 'website', url: 'https://builder.xyz' }],
    }

    const values = {
      daoLinks: [
        { key: 'website', url: 'https://builder.xyz' },
        { key: 'twitter', url: 'https://x.com/builder' },
      ],
    }

    expect(compareAndReturn(initialValues, values)).toEqual([
      {
        field: 'daoLinks',
        value: [
          { key: 'website', url: 'https://builder.xyz' },
          { key: 'twitter', url: 'https://x.com/builder' },
        ],
      },
    ])
  })

  it('returns a change when nested array order changes', () => {
    const initialValues = {
      daoLinks: [
        { key: 'website', url: 'https://builder.xyz' },
        { key: 'twitter', url: 'https://x.com/builder' },
      ],
    }

    const values = {
      daoLinks: [
        { key: 'twitter', url: 'https://x.com/builder' },
        { key: 'website', url: 'https://builder.xyz' },
      ],
    }

    expect(compareAndReturn(initialValues, values)).toEqual([
      {
        field: 'daoLinks',
        value: [
          { key: 'twitter', url: 'https://x.com/builder' },
          { key: 'website', url: 'https://builder.xyz' },
        ],
      },
    ])
  })

  it('returns a change when value type changes', () => {
    const initialValues = {
      vetoer: '0x1234',
      quorumThreshold: 5,
    }

    const values = {
      vetoer: { ens: 'alice.eth' },
      quorumThreshold: 5,
    }

    expect(compareAndReturn(initialValues, values)).toEqual([
      {
        field: 'vetoer',
        value: { ens: 'alice.eth' },
      },
    ])
  })
})
