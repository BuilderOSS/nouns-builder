import { DecodedArg } from '@buildeross/types'
import { formatDateTime } from '@buildeross/utils/helpers'
import { Flex, Stack } from '@buildeross/zord'
import { toLower } from 'lodash'
import {
  decodeEscrowData,
  decodeEscrowDataV1,
  ESCROW_TYPE,
  ESCROW_TYPE_V1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import {
  getEscrowBundler,
  getEscrowBundlerV1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useChainStore } from 'src/stores/useChainStore'
import { formatEther, Hex } from 'viem'

import { DecodedValueRenderer } from './DecodedValueRenderer'

interface EscrowArgumentDisplayProps {
  arg: DecodedArg
  target: string
}

export const EscrowArgumentDisplay: React.FC<EscrowArgumentDisplayProps> = ({
  arg,
  target,
}) => {
  const chain = useChainStore((x) => x.chain)

  // Handle V2 escrow data
  if (
    arg?.name === '_escrowData' &&
    toLower(target) === toLower(getEscrowBundler(chain.id))
  ) {
    const {
      resolverAddress,
      clientAddress,
      terminationTime,
      providerRecipientAddress,
      clientRecipientAddress,
    } = decodeEscrowData(arg.value as Hex)

    if (
      !resolverAddress ||
      !clientAddress ||
      !terminationTime ||
      !providerRecipientAddress ||
      !clientRecipientAddress
    ) {
      return null
    }

    return (
      <Stack gap={'x1'} key={arg.name}>
        <Flex>_client: {clientAddress}</Flex>
        <Flex>_resolver: {resolverAddress}</Flex>
        <Flex>_providerRecipient: {providerRecipientAddress}</Flex>
        <Flex>_clientRecipient: {clientRecipientAddress}</Flex>
        <Flex>
          _safetyValveDate: {new Date(Number(terminationTime) * 1000).toLocaleString()}
        </Flex>
      </Stack>
    )
  }

  // Handle V1 escrow data
  if (
    arg?.name === '_escrowData' &&
    toLower(target) === toLower(getEscrowBundlerV1(chain.id))
  ) {
    const {
      providerAddress,
      resolverAddress,
      clientAddress,
      terminationTime,
      providerRecipientAddress,
      escrowType,
    } = decodeEscrowDataV1(arg.value as Hex)

    if (
      !resolverAddress ||
      !clientAddress ||
      !terminationTime ||
      !providerRecipientAddress
    ) {
      return null
    }

    return (
      <Stack gap={'x1'} key={arg.name}>
        <Flex>_client: {clientAddress}</Flex>
        <Flex>_provider: {providerAddress}</Flex>
        <Flex>_resolver: {resolverAddress}</Flex>
        <Flex>_providerRecipient: {providerRecipientAddress}</Flex>
        <Flex>
          _safetyValveDate: {formatDateTime(new Date(Number(terminationTime) * 1000))}
        </Flex>
        {escrowType && toLower(escrowType) === toLower(ESCROW_TYPE_V1) && (
          <Flex>_escrowType: updatable</Flex>
        )}
      </Stack>
    )
  }

  // Handle escrow value formatting
  if (
    toLower(target) === toLower(getEscrowBundler(chain.id)) ||
    toLower(target) === toLower(getEscrowBundlerV1(chain.id))
  ) {
    let value = arg.value

    if (arg.name === '_milestoneAmounts') {
      value = arg.value
        .toString()
        .split(',')
        .map((amt: string) => `${formatEther(BigInt(amt))} ETH`)
        .join(', ')
    } else if (arg.name === '_fundAmount') {
      value = formatEther(BigInt(arg.value.toString())) + ' ETH'
    } else if (arg.name === '_escrowType') {
      value =
        toLower(arg.value.toString()) === toLower(ESCROW_TYPE)
          ? 'updatable-v2'
          : 'updatable'
    }

    return <DecodedValueRenderer name={arg.name} value={value} />
  }

  return <DecodedValueRenderer name={arg.name} value={arg.value} />
}
