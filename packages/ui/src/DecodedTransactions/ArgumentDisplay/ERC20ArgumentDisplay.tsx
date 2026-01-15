import { TokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Flex, Text } from '@buildeross/zord'
import { formatUnits } from 'viem'

import { BaseArgumentDisplay } from './BaseArgumentDisplay'

interface ERC20ArgumentDisplayProps {
  arg: DecodedArg
  tokenMetadata?: TokenMetadata | null
}

export const ERC20ArgumentDisplay: React.FC<ERC20ArgumentDisplayProps> = ({
  arg,
  tokenMetadata,
}) => {
  // Handle amount formatting for ERC20 transfers
  if (
    (arg.name === 'amount' ||
      arg.name === 'value' ||
      arg.name === '_value' ||
      arg.name === '_amount') &&
    tokenMetadata &&
    tokenMetadata.symbol
  ) {
    const decimals = tokenMetadata.decimals ?? 18
    const formattedAmount = formatUnits(BigInt(arg.value.toString()), decimals)
    const value = `${formatCryptoVal(formattedAmount)} ${tokenMetadata.symbol}`

    return (
      <Flex align="flex-start" w="100%">
        <Text pr="x1" style={{ flexShrink: 0 }}>
          {arg.name}:
        </Text>
        <Flex align="center" gap="x1">
          {tokenMetadata.logo && (
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
  }

  // Default rendering for other arguments or if metadata failed to load
  return <BaseArgumentDisplay name={arg.name} value={arg.value} />
}
