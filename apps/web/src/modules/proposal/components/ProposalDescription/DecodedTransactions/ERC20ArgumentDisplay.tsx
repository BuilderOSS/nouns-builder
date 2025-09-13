import { useTokenMetadataSingle } from '@buildeross/hooks/useTokenMetadata'
import { DecodedArg } from '@buildeross/types'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { useChainStore } from 'src/stores/useChainStore'
import { formatUnits } from 'viem'

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
    tokenMetadata &&
    tokenMetadata.symbol
  ) {
    const formattedAmount = formatUnits(
      BigInt(arg.value.toString()),
      tokenMetadata.decimals
    )
    const value = `${formatCryptoVal(formattedAmount)} ${tokenMetadata.symbol}`

    return <DecodedValueRenderer name={arg.name} value={value} />
  }

  // Default rendering for other arguments or if metadata failed to load
  return <DecodedValueRenderer name={arg.name} value={arg.value} />
}
