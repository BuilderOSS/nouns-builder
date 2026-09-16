import { beforeEach, describe, expect, it, vi } from 'vitest'

import { dashboardRequest } from './dashboardQuery'

const sdkMock = vi.hoisted(() => ({
  daosForDashboardViaProfile: vi.fn(),
}))

vi.mock('../client', () => ({
  SDK: {
    connect: () => sdkMock,
  },
}))

const address = '0x1234567890123456789012345678901234567890'

const createDao = (tokenAddress: string, name: string) => ({
  tokenAddress,
  name,
  contractImage: 'image.png',
  metadataAddress: '0xmeta',
  treasuryAddress: '0xtreasury',
  auctionAddress: '0xauction',
  governorAddress: '0xgovernor',
  links: [],
  auctionConfig: {
    minimumBidIncrement: '100',
    reservePrice: '1000',
  },
  proposals: [],
  currentAuction: null,
})

describe('dashboardRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches DAOs via Profile entity and deduplicates owner/voter', async () => {
    const dao1 = createDao('0xdao1', 'DAO 1')
    const dao2 = createDao('0xdao2', 'DAO 2')
    const dao3 = createDao('0xdao3', 'DAO 3')

    // Mock response for the first chain only, others return null
    let callCount = 0
    sdkMock.daosForDashboardViaProfile.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({
          profile: {
            id: address,
            address,
            ownerDaoCount: 2,
            voterDaoCount: 2,
            // User owns tokens in DAO1 and DAO2
            ownerDaos: [
              { id: 'owner-1', owner: address, daoTokenCount: 10, dao: dao1 },
              { id: 'owner-2', owner: address, daoTokenCount: 5, dao: dao2 },
            ],
            // User can vote in DAO2 (duplicate) and DAO3
            voterDaos: [
              { id: 'voter-1', voter: address, dao: dao2 }, // Duplicate - should be ignored
              { id: 'voter-2', voter: address, dao: dao3 },
            ],
          },
        })
      }
      return Promise.resolve({ profile: null })
    })

    const result = await dashboardRequest(address)

    // Should have 3 unique DAOs (DAO2 deduplicated)
    expect(result).toHaveLength(3)
    expect(result.map((d) => d.tokenAddress)).toEqual(['0xdao1', '0xdao2', '0xdao3'])

    // Verify DAOs are sorted by name
    expect(result[0].name).toBe('DAO 1')
    expect(result[1].name).toBe('DAO 2')
    expect(result[2].name).toBe('DAO 3')
  })

  it('handles null profile (user has no activity)', async () => {
    sdkMock.daosForDashboardViaProfile.mockResolvedValue({
      profile: null,
    })

    const result = await dashboardRequest(address)

    expect(result).toEqual([])
  })

  it('combines results from multiple chains', async () => {
    let callCount = 0
    sdkMock.daosForDashboardViaProfile.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First chain has DAO1
        return Promise.resolve({
          profile: {
            id: address,
            address,
            ownerDaoCount: 1,
            voterDaoCount: 0,
            ownerDaos: [
              {
                id: 'owner-1',
                owner: address,
                daoTokenCount: 10,
                dao: createDao('0xdao1', 'DAO 1'),
              },
            ],
            voterDaos: [],
          },
        })
      }
      // Other chains have no activity
      return Promise.resolve({ profile: null })
    })

    const result = await dashboardRequest(address)

    expect(result).toHaveLength(1)
    expect(result[0].tokenAddress).toBe('0xdao1')
  })

  it('throws error for invalid address', async () => {
    await expect(dashboardRequest('invalid')).rejects.toThrow('Invalid user address')
  })

  it('throws error for zero address', async () => {
    await expect(
      dashboardRequest('0x0000000000000000000000000000000000000000')
    ).rejects.toThrow('Zero address not allowed')
  })

  it('throws error when all chains fail', async () => {
    sdkMock.daosForDashboardViaProfile.mockRejectedValue(new Error('Network error'))

    await expect(dashboardRequest(address)).rejects.toThrow('Goldsky Request Error')
  })
})
