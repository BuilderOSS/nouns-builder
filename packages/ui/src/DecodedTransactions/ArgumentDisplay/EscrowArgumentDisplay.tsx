import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { CHAIN_ID, DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  ESCROW_TYPE,
  ESCROW_TYPE_V1,
  getEscrowBundlerV1,
} from '@buildeross/utils/escrow'
import { formatDateTime } from '@buildeross/utils/helpers'
import { Flex, Stack } from '@buildeross/zord'
import { useCallback } from 'react'
import { formatUnits, Hex } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'

const toLower = (str: string) => str.toLowerCase()

interface EscrowArgumentDisplayProps {
  chainId: CHAIN_ID
  arg: DecodedArg
  target: string
  allArguments: Record<string, DecodedArg>
}

export const EscrowArgumentDisplay: React.FC<EscrowArgumentDisplayProps> = ({
  chainId,
  arg,
  target,
  allArguments,
}) => {
  const escrowDataValue = allArguments['_escrowData']?.value
  const escrowData =
    toLower(target) === toLower(getEscrowBundlerV1(chainId))
      ? decodeEscrowDataV1(escrowDataValue as Hex)
      : decodeEscrowData(escrowDataValue as Hex)

  const { tokenMetadata } = useTokenMetadataSingle(chainId, escrowData?.tokenAddress)

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

  // Handle escrow value formatting
  let value = arg.value

  if (arg.name === '_milestoneAmounts') {
    value = arg.value
      .toString()
      .split(',')
      .map((amt: string) => `${formatAmount(BigInt(amt))}`)
      .join(', ')
  } else if (arg.name === '_fundAmount') {
    value = formatAmount(BigInt(arg.value.toString()))
  } else if (arg.name === '_escrowType') {
    value =
      toLower(arg.value.toString()) === toLower(ESCROW_TYPE)
        ? 'updatable-v2'
        : 'updatable'
  }

  return <BaseArgumentDisplay name={arg.name} value={value} />
}
