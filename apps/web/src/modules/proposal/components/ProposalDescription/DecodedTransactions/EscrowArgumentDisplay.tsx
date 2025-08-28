import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils'
import { formatDateTime } from '@buildeross/utils/helpers'
import { Flex, Stack } from '@buildeross/zord'
import { toLower } from 'lodash'
import { useCallback } from 'react'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  ESCROW_TYPE,
  ESCROW_TYPE_V1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { getEscrowBundlerV1 } from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'
import { formatUnits, Hex } from 'viem'

import { DecodedValueRenderer } from './DecodedValueRenderer'

interface EscrowArgumentDisplayProps {
  arg: DecodedArg
  target: string
  allArguments: Record<string, DecodedArg>
}

export const EscrowArgumentDisplay: React.FC<EscrowArgumentDisplayProps> = ({
  arg,
  target,
  allArguments,
}) => {
  const chain = useChainStore((x) => x.chain)

  const escrowDataValue = allArguments['_escrowData']?.value
  const escrowData =
    toLower(target) === toLower(getEscrowBundlerV1(chain.id))
      ? decodeEscrowDataV1(escrowDataValue as Hex)
      : decodeEscrowData(escrowDataValue as Hex)

  const { tokenMetadata } = useTokenMetadataSingle(chain.id, escrowData?.tokenAddress)

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

  return <DecodedValueRenderer name={arg.name} value={value} />
}
