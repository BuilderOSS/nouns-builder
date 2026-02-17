import { auctionAbi, tokenAbi } from '@buildeross/sdk/contract'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import { AddressType, Chain } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React, { useState } from 'react'
import {
  useAccount,
  useConfig,
  useReadContract,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
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
  openMinterModal?: () => void
}

export const PreAuction: React.FC<PreAuctionProps> = ({
  chain,
  onOpenAuction,
  onOpenSettings,
  remainingTokensInReserve,
  openMinterModal,
}) => {
  const { address } = useAccount()
  const config = useConfig()
  const { addresses } = useDaoStore()

  const [isUnPausing, setIsUnPausing] = useState<boolean>(false)
  const [isEditingReservedTokenId, setIsEditingReservedTokenId] = useState<boolean>(false)
  const [newReservedTokenId, setNewReservedTokenId] = useState<string>('')
  const [isUpdatingReservedTokenId, setIsUpdatingReservedTokenId] =
    useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>('')

  const { data: reservedUntilTokenId, refetch: refetchReservedTokenId } = useReadContract(
    {
      abi: tokenAbi,
      address: addresses.token as AddressType,
      functionName: 'reservedUntilTokenId',
      chainId: chain.id,
      query: {
        enabled: !!addresses.token,
      },
    }
  )

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
      const receipt = await waitForTransactionReceipt(config, {
        hash: txHash,
        chainId: chain.id,
      })
      await awaitSubgraphSync(chain.id, receipt.blockNumber)
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

  /* handle input change with validation and normalization */
  const handleReservedTokenIdChange = (value: string) => {
    // Allow empty string for clearing the input
    if (value === '') {
      setNewReservedTokenId('')
      setValidationError('')
      return
    }

    // Normalize: parse to integer, reject non-integers/decimals/negatives
    const numValue = parseInt(value, 10)

    // If parsing fails or results in NaN, reject the input
    if (isNaN(numValue)) {
      return
    }

    // Only store positive integers
    if (numValue <= 0) {
      return
    }

    // Store the normalized integer as string
    const normalizedValue = numValue.toString()
    setNewReservedTokenId(normalizedValue)

    if (!reservedUntilTokenId) {
      setValidationError('')
      return
    }

    const newValue = BigInt(normalizedValue)

    // Check if trying to lower the reserved token count
    if (newValue < reservedUntilTokenId) {
      setValidationError('Cannot lower reserved token count after minting begins')
    } else {
      setValidationError('')
    }
  }

  /* handle update reserved token id */
  const handleUpdateReservedTokenId = async () => {
    if (!addresses.token || !newReservedTokenId || validationError) return

    // Validate that the value is a valid positive integer
    const numValue = Number(newReservedTokenId)
    if (!Number.isInteger(numValue) || numValue <= 0) {
      console.error('Invalid reserved token ID: must be a positive integer')
      setValidationError('Must be a positive integer')
      return
    }

    // Check if the value is the same as current (avoid wasting gas)
    if (BigInt(newReservedTokenId) === reservedUntilTokenId) {
      setIsEditingReservedTokenId(false)
      setNewReservedTokenId('')
      setValidationError('')
      return
    }

    setIsUpdatingReservedTokenId(true)
    try {
      const txHash = await writeContractAsync({
        abi: tokenAbi,
        address: addresses.token as AddressType,
        functionName: 'setReservedUntilTokenId',
        args: [BigInt(newReservedTokenId)],
        chainId: chain.id,
      })
      await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })
      await refetchReservedTokenId()
      setIsEditingReservedTokenId(false)
      setNewReservedTokenId('')
      setValidationError('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsUpdatingReservedTokenId(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingReservedTokenId(false)
    setNewReservedTokenId('')
    setValidationError('')
  }

  return (
    <Flex className={wrapper}>
      <Flex direction={'column'} justify={'center'} className={preAuctionWrapper}>
        {reservedUntilTokenId !== undefined && reservedUntilTokenId > 0n && (
          <Box className={reserveInfoBox}>
            {!isEditingReservedTokenId ? (
              <>
                <Box className={reserveLabel}>Reserved Tokens</Box>
                <Box className={reserveCount}>
                  0 - {(reservedUntilTokenId - 1n).toString()}
                </Box>
                <Text fontSize={14} color="text3" mt="x2">
                  Total {reservedUntilTokenId.toString()} token
                  {reservedUntilTokenId === 1n ? '' : 's'} reserved
                </Text>
                {remainingTokensInReserve !== undefined && (
                  <Text fontSize={14} color="text3" mt="x1">
                    {remainingTokensInReserve.toString()} token
                    {remainingTokensInReserve === 1n ? '' : 's'} remaining to mint
                  </Text>
                )}
                <Flex gap="x2" mt="x4" direction="column">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingReservedTokenId(true)}
                    size="sm"
                    width="100%"
                  >
                    Edit Reserved Tokens
                  </Button>
                  {openMinterModal && (
                    <Button
                      variant="outline"
                      onClick={openMinterModal}
                      size="sm"
                      width="100%"
                    >
                      Manage Minters
                    </Button>
                  )}
                </Flex>
              </>
            ) : (
              <>
                <Box className={reserveLabel}>Edit Reserved Tokens</Box>
                <input
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  pattern="\d+"
                  value={newReservedTokenId}
                  onChange={(e) => handleReservedTokenIdChange(e.target.value)}
                  placeholder={reservedUntilTokenId.toString()}
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginTop: '8px',
                    borderRadius: '4px',
                    border: validationError ? '1px solid #EF4444' : '1px solid #ccc',
                  }}
                />
                {validationError && (
                  <Text fontSize={14} color="negative" mt="x2">
                    {validationError}
                  </Text>
                )}
                {!validationError &&
                  newReservedTokenId &&
                  Number(newReservedTokenId) > 0 && (
                    <Text fontSize={14} color="text3" mt="x2">
                      Will reserve tokens 0 -{' '}
                      {Math.max(Number(newReservedTokenId) - 1, 0)} (Total{' '}
                      {newReservedTokenId} token
                      {Number(newReservedTokenId) === 1 ? '' : 's'})
                    </Text>
                  )}
                <Flex gap="x2" mt="x4">
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    size="sm"
                    flex={1}
                    disabled={isUpdatingReservedTokenId}
                  >
                    Cancel
                  </Button>
                  <ContractButton
                    handleClick={handleUpdateReservedTokenId}
                    chainId={chain.id}
                    size="sm"
                    flex={1}
                    loading={isUpdatingReservedTokenId}
                    disabled={
                      !newReservedTokenId ||
                      isUpdatingReservedTokenId ||
                      !!validationError
                    }
                  >
                    Update
                  </ContractButton>
                </Flex>
              </>
            )}
          </Box>
        )}

        <ContractButton
          handleClick={handleStartAuction}
          chainId={chain.id}
          disabled={isUnPausing || unpauseIsError || unpauseIsLoading}
          loading={isUnPausing}
          className={preAuctionButtonVariants['start']}
        >
          Start Auction
        </ContractButton>

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
