import { Box, Flex, Text } from '@buildeross/zord'
import { useMemo } from 'react'

import { HoldersList } from './HoldersList'

interface Holder {
  holder: `0x${string}`
  balance: bigint | string
}

interface HoldersSectionProps {
  holders: Holder[]
  title?: string
  isDrop?: boolean
  totalSupplyWei?: bigint
}

export const HoldersSection = ({
  holders,
  title = 'Top Holders',
  isDrop = false,
  totalSupplyWei,
}: HoldersSectionProps) => {
  // Filter holders
  const filteredHolders = useMemo(() => {
    if (!holders || holders.length === 0) {
      return holders
    }

    return holders.filter((holder) => {
      const balance =
        typeof holder.balance === 'string' ? BigInt(holder.balance) : holder.balance

      // Always filter out zero balances
      if (balance === BigInt(0)) {
        return false
      }

      // For coins (when totalSupplyWei is provided), also filter out holders with >50% of total supply (likely pools)
      if (totalSupplyWei) {
        const halfSupply = totalSupplyWei / BigInt(2)
        return balance <= halfSupply
      }

      return true
    })
  }, [holders, totalSupplyWei])

  if (!filteredHolders || filteredHolders.length === 0) {
    return null
  }

  return (
    <Box mb="x3">
      <Flex align="center" mb="x3">
        <Text variant="label-sm" color="text3">
          {title}
        </Text>
      </Flex>
      <HoldersList holders={filteredHolders} isDrop={isDrop} />
    </Box>
  )
}
