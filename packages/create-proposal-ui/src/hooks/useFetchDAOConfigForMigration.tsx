import { MERKLE_METADATA_RENDERER } from '@buildeross/constants/addresses'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import {
  auctionAbi,
  governorAbi,
  metadataAbi,
  tokenAbi,
  treasuryAbi,
} from '@buildeross/sdk/contract'
import { DaoContractAddresses } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { encodeAbiParameters, parseAbiParameters, zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'

/**
 * Fetches DAO configuration from source chain for migration purposes
 * Supports both L1→L2 and L2→L2 migrations
 *
 * @param sourceChainId - Chain ID of the source DAO
 * @param targetChainId - Chain ID where DAO will be migrated to
 * @param sourceAddresses - Contract addresses of the source DAO
 * @param metadataRenderer - Optional custom metadata renderer address (uses MERKLE_PROPERTY_IPFS_ADDRESS by default)
 * @param applyAddressAliasing - Whether to apply L1→L2 address aliasing (set false for L2→L2 migrations)
 */
export const useFetchDAOConfigForMigration = ({
  sourceChainId,
  targetChainId,
  sourceAddresses,
  metadataRenderer,
  enabled = true,
}: {
  sourceChainId: CHAIN_ID
  targetChainId: CHAIN_ID
  sourceAddresses: DaoContractAddresses
  metadataRenderer?: AddressType
  enabled?: boolean
}) => {
  const contracts = setupContracts({
    addresses: sourceAddresses as Required<DaoContractAddresses>,
    chainId: sourceChainId,
  })

  const { data, isLoading, error } = useReadContracts({
    allowFailure: false,
    query: {
      enabled: enabled && !!sourceAddresses.token,
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

  if (!data || error) {
    return {
      config: undefined,
      isLoading,
      error,
    }
  }

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

  // For L2→L2 migrations, we don't apply address aliasing
  // Founders keep their original addresses
  const founderParams = existingFounders
    ? existingFounders.map((x) => ({
        wallet: x.wallet,
        ownershipPct: BigInt(x.ownershipPct),
        vestExpiry: BigInt(x.vestExpiry),
      }))
    : []

  const tokenInitStrings = encodeAbiParameters(
    parseAbiParameters(
      'string name, string symbol, string description, string daoImage, string daoWebsite, string baseRenderer'
    ),
    [name!, symbol!, description!, daoImage!, projectURI!, RENDERER_BASE]
  )

  const rendererAddress = metadataRenderer || MERKLE_METADATA_RENDERER[targetChainId]

  const tokenParams = {
    initStrings: tokenInitStrings as AddressType,
    reservedUntilTokenId: tokenId! + 1n,
    metadataRenderer: rendererAddress,
  }

  const auctionParams = {
    reservePrice: reservePrice!,
    duration: BigInt(duration!),
    founderRewardRecipent: zeroAddress,
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
    config: {
      tokenParams,
      founderParams,
      auctionParams,
      govParams,
      // Return raw values for display/editing
      rawValues: {
        name: name!,
        symbol: symbol!,
        description: description!,
        daoImage: daoImage!,
        projectURI: projectURI!,
        currentTokenId: tokenId!,
        founders: existingFounders || [],
        duration: duration!,
        reservePrice: reservePrice!,
        votingDelay: votingDelay!,
        votingPeriod: votingPeriod!,
        proposalThresholdBps: proposalThresholdBps!,
        quorumThresholdBps: quorumThresholdBps!,
        vetoer: vetoer!,
        timelockDelay: timelockDelay!,
      },
    },
    isLoading,
    error: undefined,
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
