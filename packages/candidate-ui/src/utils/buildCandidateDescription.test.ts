import { TransactionType } from '@buildeross/types'
import { describe, expect, it } from 'vitest'

import { buildCandidateDescription } from './buildCandidateDescription'

describe('buildCandidateDescription', () => {
  it('serializes candidate metadata in subgraph-readable JSON', () => {
    expect(
      buildCandidateDescription({
        title: ' Treasury Diversification ',
        summary: ' Move funds into stables. ',
        discussionUrl: ' https://forum.example/candidate ',
        transactionBundles: [
          { type: TransactionType.SEND_TOKENS, summary: 'Move funds', callCount: 2 },
        ],
      })
    ).toBe(
      JSON.stringify({
        version: 1,
        title: 'Treasury Diversification',
        description: 'Move funds into stables.',
        transactionBundles: [
          { type: TransactionType.SEND_TOKENS, summary: 'Move funds', callCount: 2 },
        ],
        discussionUrl: 'https://forum.example/candidate',
      })
    )
  })

  it('omits empty discussionUrl while keeping required keys', () => {
    expect(
      buildCandidateDescription({
        title: 'Title',
        summary: 'Summary',
        discussionUrl: '   ',
      })
    ).toBe(
      JSON.stringify({
        version: 1,
        title: 'Title',
        description: 'Summary',
      })
    )
  })
})
