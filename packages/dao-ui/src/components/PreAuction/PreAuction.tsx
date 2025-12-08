import { auctionAbi } from '@buildeross/sdk/contract'
import { useDaoStore } from '@buildeross/stores'
import { Chain } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Button, Flex } from '@buildeross/zord'
import React, { useState } from 'react'
import { useAccount, useConfig, useSimulateContract, useWriteContract } from 'wagmi'
import { readContract, waitForTransactionReceipt } from 'wagmi/actions'

import {
  preAuctionButtonVariants,
  preAuctionHelperText,
  preAuctionWrapper,
  reserveCount,
  reserveInfoBox,
  reserveLabel,
  wrapper,
} from './PreAuction.css'

interface PreAuctionProps {
  chain: Chain
  collectionAddress: string
  onOpenAuction: (tokenId: number) => void
  onOpenSettings: () => void
  remainingTokensInReserve?: bigint
  shouldShowMinterModal?: boolean
  openMinterModal?: () => void
}

export const PreAuction: React.FC<PreAuctionProps> = ({
  chain,
  onOpenAuction,
  onOpenSettings,
  remainingTokensInReserve,
  shouldShowMinterModal = false,
  openMinterModal,
}) => {
  const { address } = useAccount()
  const config = useConfig()
  const { addresses } = useDaoStore()

  const [isUnPausing, setIsUnPausing] = useState<boolean>(false)

  const {
    data: unpauseData,
    isError: unpauseIsError,
    isLoading: unpauseIsLoading,
  } = useSimulateContract({
    query: {
      enabled: !!addresses.auction,
    },
    abi: auctionAbi,
    address: addresses.auction,
    account: address,
    functionName: 'unpause',
    chainId: chain.id,
  })

  const { writeContractAsync } = useWriteContract()

  /* handle start of auction  */
  const handleStartAuction = async () => {
    if (!unpauseData) return
    setIsUnPausing(true)
    try {
      const txHash = await writeContractAsync(unpauseData.request)
      await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
    } catch (e) {
      console.error(e)
    } finally {
      setIsUnPausing(false)
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
        {remainingTokensInReserve && remainingTokensInReserve > 0n && (
          <Box className={reserveInfoBox}>
            <Box className={reserveCount}>{remainingTokensInReserve.toString()}</Box>
            <Box className={reserveLabel}>Tokens Remaining in Reserve</Box>
            {shouldShowMinterModal && !!openMinterModal && (
              <Button
                variant="outline"
                onClick={openMinterModal}
                size="sm"
                width="100%"
                mt="x4"
              >
                Setup Custom Minter
              </Button>
            )}
          </Box>
        )}

        <Button
          disabled={isUnPausing || !address || unpauseIsError || unpauseIsLoading}
          loading={isUnPausing}
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
