import { renderHook, waitFor } from '@testing-library/react'
import { DaoContractAddresses } from 'src/stores'
import { FOUNDRY_CHAIN } from 'src/test/fixtures/chain'
import { expect, vi } from 'vitest'
import { useReadContracts } from 'wagmi'

import { useAvailableUpgrade } from './useAvailableUpgrade'

vi.mock('wagmi', async () => {
  const mod = await vi.importActual<typeof import('wagmi')>('wagmi')
  return {
    ...mod,
    useReadContracts: vi.fn(),
  }
})

vi.mock('@buildeross/sdk/subgraph', async () => {
  const mod = await vi.importActual<typeof import('@buildeross/sdk/subgraph')>(
    '@buildeross/sdk/subgraph'
  )
  return {
    ...mod,
    getSdk: vi.fn(() => ({
      getProposals: () => ({ proposals: [] }),
    })),
  }
})

const chainId = FOUNDRY_CHAIN.id

const addresses = {
  governor: '0xbf9BEA8028699F922c3B2879D9CBec0179Bf7587',
  treasury: '0xC093b895c132Eb1BcEA557b231dbf6cE4c7dB8Eb',
  metadata: '0x4aBF2E72EBC38E6BdBd6425A226b03Dc0bb8d18a',
  auction: '0x8F1B054500ED7a2B06619CD2E5D70415Bc9d6b8a',
  token: '0x6e13ED8472fBBd384C260538323906fc1eCb0d7B',
} as DaoContractAddresses

describe('Use available upgrade hook', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should determine no upgrades given a set of undefined addresses', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.1.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.0.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        null,
        null,
        null,
        null,
        null,
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() =>
      useAvailableUpgrade({
        chainId,
        addresses: {
          //@ts-ignore
          governor: undefined,
          //@ts-ignore
          treasury: undefined,
          //@ts-ignore
          metadata: undefined,
          //@ts-ignore
          auction: undefined,
          //@ts-ignore
          token: undefined,
        },
      })
    )

    expect(result.current).toStrictEqual({
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: undefined,
      latest: undefined,
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  it('should determine no upgrades given contract reads loading', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [null, null, null, null, null, null, null, null, null],
      isError: false,
      isLoading: true,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current).toStrictEqual({
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: undefined,
      latest: undefined,
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  it('should determine no upgrades given an error', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [null, null, null, null, null, null, null, null, null],
      isError: true,
      isLoading: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    await waitFor(() => expect(result.current).toBeTruthy())

    expect(result.current).toStrictEqual({
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: undefined,
      latest: undefined,
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  it('should determine no upgrades given all modules are up to date', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.1.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isLoading: false,
      isError: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current).toStrictEqual({
      latest: '1.1.0',
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: {
        governor: '1.1.0',
        treasury: '1.1.0',
        metadata: '1.1.0',
        auction: '1.1.0',
        token: '1.1.0',
      },
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  it('should determine no upgrades given no latest version', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        null,
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isLoading: false,
      isError: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current).toStrictEqual({
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: undefined,
      latest: undefined,
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  //TODO: Re-visit with MSW for graphql requests
  it('should determine the available upgrades given some modules out of date', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.1.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.0.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '',
          token: '1.0.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current.latest).toBe('1.1.0')
    expect(result.current.totalContractUpgrades).toBe(3)
    expect(result.current.transaction).toBeDefined()
    expect(result.current.transaction?.transactions).toStrictEqual([
      {
        functionSignature: 'pause()',
        target: addresses.auction,
        calldata: '0x8456cb59',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.governor,
        calldata:
          '0x3659cfe60000000000000000000000009eefef0891b1895af967fe48c5d7d96e984b96a3',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.token,
        calldata:
          '0x3659cfe6000000000000000000000000e6322201ced0a4d6595968411285a39ccf9d5989',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.auction,
        calldata:
          '0x3659cfe60000000000000000000000002661fe1a882abfd28ae0c2769a90f327850397c6',
        value: '',
      },
      {
        functionSignature: 'unpause()',
        target: addresses.auction,
        calldata: '0x3f4ba83a',
        value: '',
      },
    ])
  })

  it('should determine the available upgrades given some modules out of date and auction is currently paused', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        true,
        '1.1.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.0.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '',
          token: '1.0.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current.latest).toEqual('1.1.0')
    expect(result.current.totalContractUpgrades).toBe(3)
    expect(result.current.transaction).toBeDefined()
    expect(result.current.transaction?.transactions).toStrictEqual([
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.governor,
        calldata:
          '0x3659cfe60000000000000000000000009eefef0891b1895af967fe48c5d7d96e984b96a3',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.token,
        calldata:
          '0x3659cfe6000000000000000000000000e6322201ced0a4d6595968411285a39ccf9d5989',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.auction,
        calldata:
          '0x3659cfe60000000000000000000000002661fe1a882abfd28ae0c2769a90f327850397c6',
        value: '',
      },
    ])
  })

  it('should determine available upgrades given all modules out of date', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.1.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.0.0',
          treasury: '1.0.0',
          metadata: '1.0.0',
          auction: '1.0.0',
          token: '1.0.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() => useAvailableUpgrade({ chainId, addresses }))

    expect(result.current.latest).toEqual('1.1.0')
    expect(result.current.totalContractUpgrades).toBe(5)
    expect(result.current.transaction).toBeDefined()
    expect(result.current.transaction?.transactions).toStrictEqual([
      {
        functionSignature: 'pause()',
        target: addresses.auction,
        calldata: '0x8456cb59',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.governor,
        calldata:
          '0x3659cfe60000000000000000000000009eefef0891b1895af967fe48c5d7d96e984b96a3',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.token,
        calldata:
          '0x3659cfe6000000000000000000000000e6322201ced0a4d6595968411285a39ccf9d5989',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.treasury,
        calldata:
          '0x3659cfe60000000000000000000000000b6d2473f54de3f1d80b27c92b22d13050da289a',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.auction,
        calldata:
          '0x3659cfe60000000000000000000000002661fe1a882abfd28ae0c2769a90f327850397c6',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.metadata,
        calldata:
          '0x3659cfe600000000000000000000000026f494af990123154e7cc067da7a311b07d54ae1',
        value: '',
      },
      {
        functionSignature: 'unpause()',
        target: addresses.auction,
        calldata: '0x3f4ba83a',
        value: '',
      },
    ])
  })

  it('should determine no upgrades required given provided version is met', () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.2.0',
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        {
          governor: '1.1.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.1.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() =>
      useAvailableUpgrade({ chainId, addresses, contractVersion: '1.1.0' })
    )

    expect(result.current).toStrictEqual({
      latest: '1.2.0',
      shouldUpgrade: false,
      transaction: undefined,
      currentVersions: {
        governor: '1.1.0',
        treasury: '1.1.0',
        metadata: '1.1.0',
        auction: '1.1.0',
        token: '1.1.0',
      },
      date: undefined,
      description: undefined,
      activeUpgradeProposalId: undefined,
      totalContractUpgrades: undefined,
    })
  })

  it('should determine upgrades to latest version given contract does not meet the provided version', async () => {
    vi.mocked(useReadContracts).mockReturnValue({
      data: [
        false,
        '1.2.0',
        {
          governor: '1.2.0',
          treasury: '1.2.0',
          metadata: '1.2.0',
          auction: '1.2.0',
          token: '1.2.0',
        },
        {
          governor: '1.0.0',
          treasury: '1.1.0',
          metadata: '1.1.0',
          auction: '1.1.0',
          token: '1.0.0',
        },
        '0xe6322201ced0a4d6595968411285a39ccf9d5989',
        '0x9eefef0891b1895af967fe48c5d7d96e984b96a3',
        '0x0b6d2473f54de3f1d80b27c92b22d13050da289a',
        '0x2661fe1a882abfd28ae0c2769a90f327850397c6',
        '0x26f494af990123154e7cc067da7a311b07d54ae1',
      ],
      isError: false,
      isLoading: false,
    } as any)

    const { result } = renderHook(() =>
      useAvailableUpgrade({ chainId, addresses, contractVersion: '1.1.0' })
    )

    expect(result.current.latest).toBe('1.2.0')
    expect(result.current.totalContractUpgrades).toBe(5)
    expect(result.current.transaction).toBeDefined()
    expect(result.current.transaction?.transactions).toStrictEqual([
      {
        functionSignature: 'pause()',
        target: addresses.auction,
        calldata: '0x8456cb59',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.governor,
        calldata:
          '0x3659cfe60000000000000000000000009eefef0891b1895af967fe48c5d7d96e984b96a3',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.token,
        calldata:
          '0x3659cfe6000000000000000000000000e6322201ced0a4d6595968411285a39ccf9d5989',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.treasury,
        calldata:
          '0x3659cfe60000000000000000000000000b6d2473f54de3f1d80b27c92b22d13050da289a',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.auction,
        calldata:
          '0x3659cfe60000000000000000000000002661fe1a882abfd28ae0c2769a90f327850397c6',
        value: '',
      },
      {
        functionSignature: 'upgradeTo(address)',
        target: addresses.metadata,
        calldata:
          '0x3659cfe600000000000000000000000026f494af990123154e7cc067da7a311b07d54ae1',
        value: '',
      },
      {
        functionSignature: 'unpause()',
        target: addresses.auction,
        calldata: '0x3f4ba83a',
        value: '',
      },
    ])
  })
})
