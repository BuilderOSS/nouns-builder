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
          proposalSalt: ' 0xabc ',
          proposer: '0x0000000000000000000000000000000000000001',
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
      proposal: {
        salt: '0xabc',
        proposer: '0x0000000000000000000000000000000000000001',
      },
    })
  })

  it('changes serialized metadata when only proposal nonce changes', () => {
    const base = {
      title: 'Same title',
      description: 'Same description',
      transactionBundles: [
        { type: TransactionType.CUSTOM, summary: 'Same calls', callCount: 1 },
      ],
    }

    expect(
      buildProposalMetadata({
        ...base,
        proposer: '0x0000000000000000000000000000000000000001',
        proposalSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      })
    ).not.toBe(
      buildProposalMetadata({
        ...base,
        proposer: '0x0000000000000000000000000000000000000001',
        proposalSalt:
          '0x0000000000000000000000000000000000000000000000000000000000000002',
      })
    )
  })
})
