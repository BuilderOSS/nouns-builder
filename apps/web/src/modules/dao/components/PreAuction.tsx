import { auctionAbi } from '@buildeross/sdk/contract'
import { Chain } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Button, Flex } from '@buildeross/zord'
import React, { useState } from 'react'
import { useDaoStore } from 'src/stores'
import { useAccount, useConfig, useSimulateContract, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from 'wagmi/actions'

import {
  preAuctionButtonVariants,
  preAuctionHelperText,
  preAuctionWrapper,
  wrapper,
} from './PreAuction.css'

interface PreAuctionProps {
  chain: Chain
  collectionAddress: string
  onOpenAuction: (tokenId: number) => void
  onOpenSettings: () => void
}

export const PreAuction: React.FC<PreAuctionProps> = ({
  chain,
  onOpenAuction,
  onOpenSettings,
}) => {
  const { address } = useAccount()
  const { addresses } = useDaoStore()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const config = useConfig()

  const { data, isError } = useSimulateContract({
    query: {
      enabled: !!addresses.auction,
    },
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'unpause',
    chainId: chain.id,
  })

  const { writeContractAsync } = useWriteContract()

  /* handle start of auction  */
  const handleStartAuction = async () => {
    if (!data) return
    setIsLoading(true)
    try {
      const txHash = await writeContractAsync(data.request)
      if (txHash)
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
      setIsLoading(false)
    } catch (e) {
      console.error(e)
      setIsLoading(false)
      return
    }

    const auction = await readContract(config, {
      address: addresses.auction!,
      abi: auctionAbi,
      functionName: 'auction',
      chainId: chain.id,
    })

    const [tokenId] = unpackOptionalArray(auction, 6)
    if (tokenId) onOpenAuction(Number(tokenId))
  }

  return (
    <Flex className={wrapper}>
      <Flex direction={'column'} justify={'center'} className={preAuctionWrapper}>
        <Button
          disabled={isLoading || !address || isError}
          loading={isLoading}
          onClick={handleStartAuction}
          className={preAuctionButtonVariants['start']}
        >
          Start Auction
        </Button>

        <Button className={preAuctionButtonVariants['edit']} onClick={onOpenSettings}>
          Edit Settings
        </Button>

        <Box className={preAuctionHelperText} mt={'x4'}>
          You can change settings before you start the auction
        </Box>
      </Flex>
    </Flex>
  )
}
