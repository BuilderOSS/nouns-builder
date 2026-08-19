import { describe, expect, it } from 'vitest'

import type { ProposerSignature } from '../CandidatePromoteButton'
import { compareProposerSignaturesBySigner } from './CandidateSigners'

const signature = (signer: `0x${string}`): ProposerSignature => ({
  signer,
  nonce: 0n,
  deadline: 0n,
  sig: '0x',
})

describe('compareProposerSignaturesBySigner', () => {
  it('sorts signatures by signer address in ascending order', () => {
    const signatures = [
      signature('0x00000000000000000000000000000000000000b0'),
      signature('0x0000000000000000000000000000000000000001'),
      signature('0x00000000000000000000000000000000000000A0'),
    ]

    expect(
      signatures.sort(compareProposerSignaturesBySigner).map((sig) => sig.signer)
    ).toEqual([
      '0x0000000000000000000000000000000000000001',
      '0x00000000000000000000000000000000000000A0',
      '0x00000000000000000000000000000000000000b0',
    ])
  })
})
