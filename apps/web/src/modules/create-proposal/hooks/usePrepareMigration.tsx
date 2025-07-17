import {
  L1_CROSS_DOMAIN_MESSENGER,
  L2_MIGRATION_DEPLOYER,
} from '@buildeross/constants/addresses'
import SWR_KEYS from '@buildeross/constants/swrKeys'
import { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import axios from 'axios'
import useSWRImmutable from 'swr/immutable'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

import { auctionAbi, merklePropertyMetadataAbi } from 'src/data/contract/abis'
import { messengerABI } from 'src/data/contract/abis/L1CrossDomainMessenger'
import { L2DeployerABI } from 'src/data/contract/abis/L2MigrationDeployer'
import { encodedDaoMetadataRequest } from 'src/data/subgraph/requests/daoMetadata'
import { DaoMember } from 'src/data/subgraph/requests/memberSnapshot'
import { Transaction } from 'src/modules/create-proposal/stores'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { unpackOptionalArray } from 'src/utils/helpers'

import { prepareAttributesMerkleRoot } from '../utils/prepareAttributesMerkleRoot'
import { prepareMemberMerkleRoot } from '../utils/prepareMemberMerkleRoot'
import { useFetchCurrentDAOConfig } from './useFetchCurrentDAOConfig'

const UINT_64_MAX = 18446744073709551615n

export const usePrepareMigration = ({
  enabled,
  migratingToChainId,
}: {
  enabled: boolean
  migratingToChainId: CHAIN_ID
}): { transactions: Transaction[] | undefined; error: Error | undefined } => {
  const chain = useChainStore((x) => x.chain)
  const { addresses: currentAddresses } = useDaoStore()

  const currentDAOConfig = useFetchCurrentDAOConfig({
    enabled,
    chainId: chain.id,
    migratingToChainId,
    currentAddresses,
  })

  const { data } = useReadContract({
    query: {
      enabled,
    },
    abi: auctionAbi,
    address: currentAddresses.auction as AddressType,
    functionName: 'auction',
    chainId: chain.id,
  })

  const [currentTokenId] = unpackOptionalArray(data, 6)

  const { data: attributesMerkleRoot, error: attributesError } = useSWRImmutable(
    enabled && currentTokenId && currentAddresses.metadata
      ? [
          SWR_KEYS.METADATA_ATTRIBUTES_MERKLE_ROOT,
          currentAddresses.metadata,
          currentTokenId,
          chain.id,
        ]
      : null,
    async ([_key, metadata, tokenId, chainId]) => {
      const attributes = await axios
        .get<
          number[][]
        >(`/api/migrate/attributes?metadata=${metadata}&chainId=${chainId}&finalTokenId=${tokenId}`)
        .then((x) => x.data)
      return prepareAttributesMerkleRoot(attributes)
    }
  )

  const { data: memberMerkleRoot, error: memberError } = useSWRImmutable(
    enabled && currentAddresses.token
      ? [SWR_KEYS.TOKEN_HOLDERS_MERKLE_ROOT, currentAddresses.token, chain.id]
      : null,
    async () => {
      const snapshot = await axios
        .get<
          DaoMember[]
        >(`/api/migrate/snapshot?token=${currentAddresses.token}&chainId=${chain.id}`)
        .then((x) => x.data)
      return prepareMemberMerkleRoot(snapshot)
    }
  )

  const { data: encodedMetadata, error: metadataError } = useSWRImmutable(
    enabled && currentAddresses.token
      ? [SWR_KEYS.ENCODED_DAO_METADATA, currentAddresses.token, chain.id]
      : undefined,
    async ([_key, token, chainId]) => encodedDaoMetadataRequest(chainId, token)
  )

  if (!attributesMerkleRoot || !memberMerkleRoot || !currentDAOConfig || !encodedMetadata)
    return {
      transactions: undefined,
      error: attributesError || memberError || metadataError,
    }

  const minterParams = {
    mintStart: 0n,
    mintEnd: UINT_64_MAX,
    pricePerToken: 0n,
    merkleRoot: memberMerkleRoot,
  }

  return {
    transactions: prepareTransactions({
      l1CrossDomainMessenger: L1_CROSS_DOMAIN_MESSENGER[migratingToChainId],
      currentDAOConfig,
      attributesMerkleRoot,
      encodedMetadata,
      minterParams,
      migratingToChainId,
    }),
    error: undefined,
  }
}

const prepareTransactions = ({
  l1CrossDomainMessenger,
  currentDAOConfig,
  attributesMerkleRoot,
  encodedMetadata,
  minterParams,
  migratingToChainId,
}: {
  l1CrossDomainMessenger: AddressType
  currentDAOConfig: ReturnType<typeof useFetchCurrentDAOConfig>
  attributesMerkleRoot: BytesType
  encodedMetadata: BytesType[]
  minterParams: {
    mintStart: bigint
    mintEnd: bigint
    pricePerToken: bigint
    merkleRoot: BytesType
  }
  migratingToChainId: CHAIN_ID
}) => {
  const { founderParams, tokenParams, auctionParams, govParams } = currentDAOConfig!

  const ONE_HOUR_IN_SECONDS = 3600n

  const delayedGovernanceAmount = 24n * ONE_HOUR_IN_SECONDS
  const minimumMetadataCalls = BigInt(encodedMetadata.length)
  const l2MigrationDeployer = L2_MIGRATION_DEPLOYER[migratingToChainId]

  const deployerParams = encodeFunctionData({
    abi: L2DeployerABI,
    functionName: 'deploy',
    args: [
      founderParams,
      tokenParams,
      auctionParams,
      govParams,
      minterParams,
      delayedGovernanceAmount,
      minimumMetadataCalls,
    ],
  })

  const metadataParams = encodedMetadata.map((x) =>
    encodeFunctionData({
      abi: L2DeployerABI,
      functionName: 'callMetadataRenderer',
      args: [x],
    })
  )

  const metadataAttributesParams = encodeFunctionData({
    abi: L2DeployerABI,
    functionName: 'callMetadataRenderer',
    args: [
      encodeFunctionData({
        abi: merklePropertyMetadataAbi,
        functionName: 'setAttributeMerkleRoot',
        args: [attributesMerkleRoot],
      }),
    ],
  })

  const renounceParams = encodeFunctionData({
    abi: L2DeployerABI,
    functionName: 'renounceOwnership',
  })

  const deployTx: Transaction = {
    target: l1CrossDomainMessenger,
    functionSignature: 'sendMessage',
    value: '',
    calldata: encodeFunctionData({
      abi: messengerABI,
      functionName: 'sendMessage',
      args: [l2MigrationDeployer, deployerParams, 0],
    }),
  }

  const metadataTxs: Transaction[] = metadataParams.map((x) => ({
    target: l1CrossDomainMessenger,
    functionSignature: 'sendMessage',
    value: '',
    calldata: encodeFunctionData({
      abi: messengerABI,
      functionName: 'sendMessage',
      args: [l2MigrationDeployer, x, 0],
    }),
  }))

  const metadataAttributesTx: Transaction = {
    target: l1CrossDomainMessenger,
    functionSignature: 'sendMessage',
    value: '',
    calldata: encodeFunctionData({
      abi: messengerABI,
      functionName: 'sendMessage',
      args: [l2MigrationDeployer, metadataAttributesParams, 0],
    }),
  }

  const renounceTx: Transaction = {
    target: l1CrossDomainMessenger,
    functionSignature: 'sendMessage',
    value: '',
    calldata: encodeFunctionData({
      abi: messengerABI,
      functionName: 'sendMessage',
      args: [l2MigrationDeployer, renounceParams, 0],
    }),
  }

  return [deployTx, ...metadataTxs, metadataAttributesTx, renounceTx]
}
