import { formatPrice } from '@buildeross/utils/numbers'
import { formatUnits } from 'viem'

export const formatFeeDisplay = (feeWei: bigint, ethUsdPrice?: number) => {
  const ethValue = formatUnits(feeWei, 18)
  const usdValue = ethUsdPrice ? parseFloat(ethValue) * ethUsdPrice : undefined

  return {
    ethValue,
    usdLabel: formatPrice(usdValue),
  }
}
