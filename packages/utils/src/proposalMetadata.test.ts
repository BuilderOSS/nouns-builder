import { TransactionType } from '@buildeross/types'
import { describe, expect, it } from 'vitest'

import { buildProposalMetadata } from './proposalMetadata'

describe('buildProposalMetadata', () => {
  it('serializes the canonical proposal metadata shape', () => {
    expect(
      JSON.parse(
        buildProposalMetadata({
          title: ' Treasury Diversification ',
          description: ' Move funds into stables. ',
          representedAddress: ' 0x1234 ',
          discussionUrl: ' https://forum.example/proposal ',
          transactionBundles: [
            { type: TransactionType.SEND_TOKENS, summary: 'Move funds', callCount: 2 },
          ],
        })
      )
    ).toEqual({
      version: 1,
      title: 'Treasury Diversification',
      description: 'Move funds into stables.',
      transactionBundles: [
        { type: TransactionType.SEND_TOKENS, summary: 'Move funds', callCount: 2 },
      ],
      representedAddress: '0x1234',
      discussionUrl: 'https://forum.example/proposal',
    })
  })
})
