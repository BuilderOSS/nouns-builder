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
        salt: '0xsalt',
        proposer: '0x0000000000000000000000000000000000000001',
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
        candidate: {
          salt: '0xsalt',
          proposer: '0x0000000000000000000000000000000000000001',
        },
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

  it('changes the serialized description when only candidate identity changes', () => {
    const base = {
      title: 'Same title',
      summary: 'Same summary',
      transactionBundles: [
        { type: TransactionType.CUSTOM, summary: 'Same calls', callCount: 1 },
      ],
    }

    expect(
      buildCandidateDescription({
        ...base,
        proposer: '0x0000000000000000000000000000000000000001',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000002',
      })
    ).not.toBe(
      buildCandidateDescription({
        ...base,
        proposer: '0x0000000000000000000000000000000000000001',
        salt: '0x0000000000000000000000000000000000000000000000000000000000000004',
      })
    )
  })
})
