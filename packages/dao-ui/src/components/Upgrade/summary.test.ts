import type { AddressType, DaoContractAddresses, Transaction } from '@buildeross/types'
import { describe, expect, it } from 'vitest'

import {
  getUpgradedContracts,
  isGovernorUpgrade,
  replaceV3SummaryContractDetails,
} from './summary'

const addresses = {
  governor: '0x1111111111111111111111111111111111111111',
  treasury: '0x2222222222222222222222222222222222222222',
  token: '0x3333333333333333333333333333333333333333',
  auction: '0x4444444444444444444444444444444444444444',
  metadata: '0x5555555555555555555555555555555555555555',
} as DaoContractAddresses

const completeAddresses = addresses as Required<DaoContractAddresses>

const upgrade = (target: AddressType): Transaction => ({
  target,
  functionSignature: 'upgradeTo(address)',
  calldata: '0x',
  value: '',
})

describe('V3 upgrade summary', () => {
  it('uses only implementation upgrades to identify upgraded contracts', () => {
    const transactions = [
      { ...upgrade(completeAddresses.auction), functionSignature: 'pause()' },
      upgrade(completeAddresses.governor),
      upgrade(completeAddresses.token),
      upgrade(completeAddresses.auction),
      { ...upgrade(completeAddresses.auction), functionSignature: 'unpause()' },
    ]

    expect(getUpgradedContracts(transactions, addresses)).toEqual([
      'governor',
      'token',
      'auction',
    ])
  })

  it('lists the actual upgraded and unchanged contracts in the proposal summary', () => {
    const summary = replaceV3SummaryContractDetails(
      'Upgraded: {{UPGRADED_CONTRACTS}}. Unchanged: {{UNCHANGED_CONTRACTS}}. {{GOVERNOR_CONFIGURATION}}',
      [upgrade(completeAddresses.governor), upgrade(completeAddresses.metadata)],
      addresses
    )

    expect(summary).toBe(
      "Upgraded: Governor, MetadataRenderer. Unchanged: Treasury, Token, Auction. The Governor's updatable proposal period is set to {{UPDATABLE_PERIOD}} as part of this proposal."
    )
  })

  it('does not describe a Governor configuration when Governor is not upgraded', () => {
    const summary = replaceV3SummaryContractDetails(
      '{{GOVERNOR_CONFIGURATION}}',
      [upgrade(completeAddresses.token)],
      addresses
    )

    expect(summary).toBe(
      "This proposal does not change the Governor's updatable proposal period."
    )
  })

  it('only enables period configuration when Governor is upgraded', () => {
    expect(isGovernorUpgrade([upgrade(completeAddresses.governor)], addresses)).toBe(true)
    expect(isGovernorUpgrade([upgrade(completeAddresses.token)], addresses)).toBe(false)
  })
})
