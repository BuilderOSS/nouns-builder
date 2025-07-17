import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Flex, Text } from '@buildeross/zord'
import { formatUnits } from 'viem'

import { useTokenMetadataSingle } from 'src/hooks/useTokenMetadata'
import { useChainStore } from 'src/stores/useChainStore'

import { DecodedValueRenderer } from './DecodedValueRenderer'

interface ERC20ArgumentDisplayProps {
  arg: DecodedArg
  target: string
}

export const ERC20ArgumentDisplay: React.FC<ERC20ArgumentDisplayProps> = ({
  arg,
  target,
}) => {
  const chain = useChainStore((x) => x.chain)
  const { tokenMetadata } = useTokenMetadataSingle(chain.id, target as `0x${string}`)

  // Handle amount formatting for ERC20 transfers
  if (
    (arg.name === 'amount' ||
      arg.name === 'value' ||
      arg.name === '_value' ||
      arg.name === '_amount') &&
    tokenMetadata
  ) {
    const formattedAmount = formatUnits(
      BigInt(arg.value.toString()),
      tokenMetadata.decimals
    )
    const value = `${formatCryptoVal(formattedAmount)} ${tokenMetadata.symbol}`

    return (
      <Flex key={arg.name} align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
        <Text>{value}</Text>
      </Flex>
    )
  }

  // Default rendering for other arguments or if metadata failed to load
  return <DecodedValueRenderer name={arg.name} value={arg.value} />
}
