import { getProfileDaoChainLabel } from './ProfileDaoSelector'

describe('getProfileDaoChainLabel', () => {
  it('uses each otherwise-identical membership record chain id', () => {
    const sharedDao = {
      name: 'Same DAO',
      collectionAddress: '0xDaa0000000000000000000000000000000000000',
    }
    const ethereumMembership = { ...sharedDao, chainId: 1 }
    const baseMembership = { ...sharedDao, chainId: 8453 }

    expect(getProfileDaoChainLabel(ethereumMembership.chainId)).toBe('ETH')
    expect(getProfileDaoChainLabel(baseMembership.chainId)).toBe('Base')
  })
})
