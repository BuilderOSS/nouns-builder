import { TokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils'
import { DecodedEscrowData, ESCROW_TYPE, ESCROW_TYPE_V1 } from '@buildeross/utils/escrow'
import { formatDateTime } from '@buildeross/utils/helpers'
import { Flex, Stack, Text } from '@buildeross/zord'
import { useCallback } from 'react'
import { formatUnits } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'

const toLower = (str: string) => str.toLowerCase()

interface EscrowArgumentDisplayProps {
  arg: DecodedArg
  tokenMetadata?: TokenMetadata
  escrowData?: DecodedEscrowData | null
}

export const EscrowArgumentDisplay: React.FC<EscrowArgumentDisplayProps> = ({
  arg,
  tokenMetadata,
  escrowData,
}) => {
  const formatAmount = useCallback(
    (amount: bigint) => {
      if (!tokenMetadata) return amount.toString()
      return `${formatCryptoVal(formatUnits(amount, tokenMetadata.decimals))} ${tokenMetadata.symbol}`
    },
    [tokenMetadata]
  )

  // Handle V2 escrow data
  if (arg?.name === '_escrowData') {
    if (!escrowData) {
      return null
    }

    const {
      clientAddress,
      tokenAddress,
      resolverAddress,
      providerAddress,
      providerRecipientAddress,
      clientRecipientAddress,
      terminationTime,
      escrowType,
    } = escrowData

    if (!resolverAddress || !clientAddress) return null
    return (
      <Stack gap={'x1'} key={arg.name}>
        {tokenAddress && <Flex>_token: {tokenAddress}</Flex>}
        <Flex>_client: {clientAddress}</Flex>
        {clientRecipientAddress && (
          <Flex>_clientRecipient: {clientRecipientAddress}</Flex>
        )}
        {providerAddress && <Flex>_provider: {providerAddress}</Flex>}
        {providerRecipientAddress && (
          <Flex>_providerRecipient: {providerRecipientAddress}</Flex>
        )}
        <Flex>_resolver: {resolverAddress}</Flex>
        {terminationTime && (
          <Flex>
            _safetyValveDate: {formatDateTime(new Date(Number(terminationTime) * 1000))}
          </Flex>
        )}
        {escrowType && toLower(escrowType) === toLower(ESCROW_TYPE_V1) && (
          <Flex>_escrowType: updatable</Flex>
        )}
      </Stack>
    )
  }

  if (arg.name === '_milestoneAmounts') {
    const values = arg.value
      .toString()
      .split(',')
      .map((amt: string) => `${formatAmount(BigInt(amt))}`)

    return (
      <>
        <Flex wrap="wrap" align="flex-start">
          <Text pr="x1" style={{ flexShrink: 0 }}>
            {arg.name}:
          </Text>
          <Text>[</Text>
        </Flex>
        <Stack pl="x4" gap="x1">
          {values.map((item, index) => (
            <Flex align="center" gap="x1" key={`${arg.name}-${index}`}>
              {tokenMetadata?.logo && (
                <img
                  src={tokenMetadata.logo}
                  alt={tokenMetadata.symbol}
                  loading="lazy"
                  decoding="async"
                  width="16px"
                  height="16px"
                  style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }}
                />
              )}
              <Text>{item}</Text>
            </Flex>
          ))}
        </Stack>
        <Text>]</Text>
      </>
    )
  } else if (arg.name === '_fundAmount') {
    const value = formatAmount(BigInt(arg.value.toString()))

    return (
      <Flex align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
        <Flex align="center" gap="x1">
          {tokenMetadata?.logo && (
            <img
              src={tokenMetadata.logo}
              alt={tokenMetadata.symbol}
              loading="lazy"
              decoding="async"
              width="16px"
              height="16px"
              style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }}
            />
          )}
          <Text>{value}</Text>
        </Flex>
      </Flex>
    )
  } else if (arg.name === '_escrowType') {
    const value =
      toLower(arg.value.toString()) === toLower(ESCROW_TYPE)
        ? 'updatable-v2'
        : 'updatable'

    return <BaseArgumentDisplay name={arg.name} value={value} />
  }

  // fallback
  return <BaseArgumentDisplay name={arg.name} value={arg.value} />
}
