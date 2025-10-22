import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNftMetadata } from '@buildeross/hooks/useNftMetadata'
import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { CHAIN_ID, DecodedTransactionData } from '@buildeross/types'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ArgumentDisplay } from '../ArgumentDisplay'

export const DecodedDisplay: React.FC<{
  chainId: CHAIN_ID
  transaction: DecodedTransactionData
  target: string
}> = ({ chainId, transaction, target }) => {
  const sortedArgs = React.useMemo(() => {
    const keys = Object.keys(transaction.args)
    const inOrder = (transaction.argOrder as string[]).filter((k) => keys.includes(k))
    const rest = keys.filter((k) => !inOrder.includes(k)).sort()
    return [...inOrder, ...rest]
  }, [transaction.args, transaction.argOrder])

  // Determine single token address for ERC20 operations
  const tokenAddress = React.useMemo(() => {
    // For ERC20 transfer/approve, use target
    if (
      transaction.functionName === 'transfer' ||
      transaction.functionName === 'approve'
    ) {
      return target
    }

    // For escrow operations, get token from escrow data
    const escrowDataArg = transaction.args['_escrowData']
    if (escrowDataArg) {
      const escrowData =
        target.toLowerCase() === getEscrowBundlerV1(chainId).toLowerCase()
          ? decodeEscrowDataV1(escrowDataArg.value as `0x${string}`)
          : decodeEscrowData(escrowDataArg.value as `0x${string}`)

      return escrowData?.tokenAddress
    }

    return null
  }, [transaction.args, transaction.functionName, target, chainId])

  // Determine single NFT contract and token ID
  const nftInfo = React.useMemo(() => {
    if (transaction.functionName !== 'safeTransferFrom') return null

    for (const argKey of sortedArgs) {
      const arg = transaction.args[argKey]
      if (
        arg.name === 'tokenId' ||
        arg.name === 'id' ||
        arg.name === '_tokenId' ||
        arg.name === '_id'
      ) {
        return { contract: target, tokenId: arg.value as string }
      }
    }

    return null
  }, [transaction.args, transaction.functionName, target, sortedArgs])

  // Fetch token metadata only if we have a token address
  const { tokenMetadata } = useTokenMetadataSingle(
    chainId,
    tokenAddress as `0x${string}` | undefined
  )

  // Fetch NFT metadata only if we have NFT info
  const { metadata: nftMetadata } = useNftMetadata(
    chainId,
    nftInfo?.contract as `0x${string}` | undefined,
    nftInfo?.tokenId
  )

  // Prepare escrow data
  const escrowData = React.useMemo(() => {
    const escrowDataArg = transaction.args['_escrowData']
    if (!escrowDataArg) return null

    return target.toLowerCase() === getEscrowBundlerV1(chainId).toLowerCase()
      ? decodeEscrowDataV1(escrowDataArg.value as `0x${string}`)
      : decodeEscrowData(escrowDataArg.value as `0x${string}`)
  }, [transaction.args, target, chainId])

  return (
    <Stack style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
      <Stack gap={'x1'}>
        <Box
          color={'secondary'}
          fontWeight={'heading'}
          className={atoms({ textDecoration: 'underline' })}
        >
          <a
            href={`${ETHERSCAN_BASE_URL[chainId]}/address/${target}`}
            target="_blank"
            rel="noreferrer"
          >
            <Text display={{ '@initial': 'flex', '@768': 'none' }}>
              {walletSnippet(target)}
            </Text>
            <Text display={{ '@initial': 'none', '@768': 'flex' }}>{target}</Text>
          </a>
        </Box>
        <Flex pl={'x2'}>
          {`.${transaction.functionName}(`}
          {sortedArgs.length === 0 ? `)` : null}
        </Flex>

        <Stack pl={'x4'} gap={'x1'}>
          {sortedArgs.map((argKey, i) => {
            const arg = transaction.args[argKey]

            return (
              <ArgumentDisplay
                chainId={chainId}
                key={`${argKey}-${arg.name}-${i}`}
                arg={arg}
                target={target}
                functionName={transaction.functionName}
                tokenMetadata={tokenMetadata}
                nftMetadata={nftMetadata}
                escrowData={escrowData}
              />
            )
          })}
        </Stack>

        {sortedArgs.length > 0 ? `)` : null}
      </Stack>
    </Stack>
  )
}
