import {
  L2_MIGRATION_DEPLOYER,
  MERKLE_METADATA_RENDERER,
  NULL_ADDRESS,
} from '@buildeross/constants/addresses'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import useSWRImmutable from 'swr/immutable'
import { encodeAbiParameters, parseAbiParameters } from 'viem'
import { useReadContracts } from 'wagmi'

import {
  auctionAbi,
  governorAbi,
  metadataAbi,
  tokenAbi,
  treasuryAbi,
} from 'src/data/contract/abis'
import { DaoContractAddresses } from 'src/stores/useDaoStore'
import { unpackOptionalArray } from 'src/utils/helpers'

import { applyL1ToL2Alias } from '../utils/applyL1ToL2Alias'

export const useFetchCurrentDAOConfig = ({
  chainId,
  migratingToChainId,
  currentAddresses,
  enabled,
}: {
  enabled?: boolean
  chainId: CHAIN_ID
  migratingToChainId: CHAIN_ID
  currentAddresses: DaoContractAddresses
}) => {
  const contracts = setupContracts({
    addresses: currentAddresses as Required<DaoContractAddresses>,
    chainId,
  })

  const { data } = useReadContracts({
    allowFailure: false,
    query: {
      enabled,
    },
    contracts: [
      { ...contracts.token, functionName: 'name' },
      { ...contracts.token, functionName: 'symbol' },
      { ...contracts.token, functionName: 'getFounders' },
      { ...contracts.metadata, functionName: 'contractImage' },
      { ...contracts.metadata, functionName: 'description' },
      { ...contracts.metadata, functionName: 'projectURI' },
      { ...contracts.auction, functionName: 'duration' },
      { ...contracts.auction, functionName: 'reservePrice' },
      { ...contracts.auction, functionName: 'auction' },
      { ...contracts.governor, functionName: 'votingDelay' },
      { ...contracts.governor, functionName: 'votingPeriod' },
      { ...contracts.governor, functionName: 'proposalThresholdBps' },
      { ...contracts.governor, functionName: 'quorumThresholdBps' },
      { ...contracts.governor, functionName: 'vetoer' },
      { ...contracts.treasury, functionName: 'delay' },
    ] as const,
  })

  const [
    name,
    symbol,
    existingFounders,
    daoImage,
    description,
    projectURI,
    duration,
    reservePrice,
    auction,
    votingDelay,
    votingPeriod,
    proposalThresholdBps,
    quorumThresholdBps,
    vetoer,
    timelockDelay,
  ] = unpackOptionalArray(data, 15)

  const [tokenId] = unpackOptionalArray(auction, 6)

  const { data: foundersAliased, error: foundersError } = useSWRImmutable(
    existingFounders && existingFounders.length > 0
      ? ['founder-allias', existingFounders]
      : undefined,
    ([_key, founders]) => {
      return Promise.all(
        founders.map(async (x) => {
          return {
            ...x,
            wallet: await applyL1ToL2Alias({ l1ChainId: chainId, address: x.wallet }),
          }
        })
      )
    }
  )

  if (!data || foundersError) return undefined

  // We need to add the migration helper config as a founder so it can handle setting up metadata on L2
  const L2MigrationDeployerFounderConfig = {
    wallet: L2_MIGRATION_DEPLOYER[migratingToChainId],
    ownershipPct: 0n,
    vestExpiry: 0n,
  }

  const founderParams = foundersAliased
    ? [
        L2MigrationDeployerFounderConfig,
        ...foundersAliased.map((x) => ({
          wallet: x.wallet,
          ownershipPct: BigInt(x.ownershipPct),
          vestExpiry: BigInt(x.vestExpiry),
        })),
      ]
    : [L2MigrationDeployerFounderConfig]

  const tokenInitStrings = encodeAbiParameters(
    parseAbiParameters(
      'string name, string symbol, string description, string daoImage, string daoWebsite, string baseRenderer'
    ),
    [name!, symbol!, description!, daoImage!, projectURI!, RENDERER_BASE]
  )

  const tokenParams = {
    initStrings: tokenInitStrings as AddressType,
    reservedUntilTokenId: tokenId! + 1n,
    metadataRenderer: MERKLE_METADATA_RENDERER[migratingToChainId],
  }

  const auctionParams = {
    reservePrice: reservePrice!,
    duration: BigInt(duration!),
    founderRewardRecipent: NULL_ADDRESS,
    founderRewardBps: 0,
  }

  const govParams = {
    timelockDelay: timelockDelay!,
    votingDelay: votingDelay!,
    votingPeriod: votingPeriod!,
    proposalThresholdBps: proposalThresholdBps!,
    quorumThresholdBps: quorumThresholdBps!,
    vetoer: vetoer!,
  }

  return {
    tokenParams,
    founderParams,
    auctionParams,
    govParams,
  }
}

const setupContracts = ({
  addresses,
  chainId,
}: {
  addresses: Required<DaoContractAddresses>
  chainId: CHAIN_ID
}) => {
  const token = {
    abi: tokenAbi,
    address: addresses.token,
    chainId,
  }
  const metadata = {
    abi: metadataAbi,
    address: addresses.metadata,
    chainId,
  }
  const auction = {
    abi: auctionAbi,
    address: addresses.auction,
    chainId,
  }
  const governor = {
    abi: governorAbi,
    address: addresses.governor,
    chainId,
  }
  const treasury = {
    abi: treasuryAbi,
    address: addresses.treasury,
    chainId,
  }

  return {
    token,
    metadata,
    auction,
    governor,
    treasury,
  }
}
