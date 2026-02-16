import { ZORA_COMMENTS } from '@buildeross/constants'
import { zoraCommentsAbi } from '@buildeross/sdk'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { TextArea } from '@buildeross/ui/Fields'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { Address, erc20Abi, parseEther, zeroAddress } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import {
  commentFormContainer,
  commentFormError,
  commentFormSuccess,
} from './CoinCommentForm.css'

interface CoinCommentFormProps {
  coinAddress: Address
  chainId: number
  onCommentPosted?: () => void
}

export const CoinCommentForm: React.FC<CoinCommentFormProps> = ({
  coinAddress,
  chainId,
  onCommentPosted,
}) => {
  const config = useConfig()
  const { address: userAddress } = useAccount()
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [success, setSuccess] = useState<string | undefined>()

  // Check if user holds the coin
  const { data: balance, isLoading: isLoadingBalance } = useReadContract({
    address: coinAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !!userAddress,
    },
  })

  const hasBalance = balance !== undefined && balance > 0n

  const handleComment = useCallback(async () => {
    if (!userAddress) {
      setError('Please connect your wallet')
      return
    }

    if (!commentText.trim()) {
      setError('Please enter a comment')
      return
    }

    setError(undefined)
    setSuccess(undefined)
    setIsSubmitting(true)

    try {
      // Empty CommentIdentifier struct for replyTo (top-level comment)
      const emptyReplyTo = {
        commenter: zeroAddress,
        contractAddress: zeroAddress,
        tokenId: 0n,
        nonce:
          '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
      }

      // Simulate the contract call
      const simulation = await simulateContract(config, {
        abi: zoraCommentsAbi,
        address: ZORA_COMMENTS as Address,
        functionName: 'comment',
        args: [
          userAddress, // commenter
          coinAddress, // contractAddress
          0n, // tokenId (0 for ERC20 coins)
          commentText.trim(), // text
          emptyReplyTo, // replyTo
          zeroAddress, // commenterSmartWallet
          zeroAddress, // referrer
        ],
        value: parseEther('1000', 'gwei'), // 1000 gwei spark value
      })

      // Execute the transaction
      const txHash = await writeContract(config, simulation.request)

      // Wait for confirmation
      if (txHash) {
        await waitForTransactionReceipt(config, { hash: txHash, chainId })

        // Clear the input and show success message
        setCommentText('')
        setSuccess('Comment posted successfully!')

        // Call the callback to refresh comments
        if (onCommentPosted) {
          onCommentPosted()
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(undefined), 3000)
      }
    } catch (err: any) {
      console.error('Error posting comment:', err)

      // Handle specific error types
      if (err.message?.includes('User rejected')) {
        setError('Transaction was rejected')
      } else if (err.message?.includes('insufficient funds')) {
        setError('Insufficient funds to pay for the comment (1 gwei required)')
      } else {
        setError(err.message || 'Failed to post comment. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [config, userAddress, coinAddress, chainId, commentText, onCommentPosted])

  // If user is not connected, show connect message
  if (!userAddress) {
    return (
      <Box className={commentFormContainer}>
        <Text variant="paragraph-md" color="text3" align="center">
          Please connect your wallet to comment
        </Text>
      </Box>
    )
  }

  // If still loading balance, show loading state
  if (isLoadingBalance) {
    return (
      <Box className={commentFormContainer}>
        <Text variant="paragraph-md" color="text3" align="center">
          Loading...
        </Text>
      </Box>
    )
  }

  // If user doesn't hold the coin, show holder-only message
  if (!hasBalance) {
    return (
      <Box className={commentFormContainer}>
        <Text variant="paragraph-md" color="text3" align="center">
          You must hold this coin to comment on this post
        </Text>
      </Box>
    )
  }

  // User holds the coin, show the comment form
  return (
    <Box className={commentFormContainer}>
      <TextArea
        id="comment"
        value={commentText}
        onChange={(e: any) => {
          setCommentText(e.target.value)
          // Clear errors when user starts typing
          if (error) setError(undefined)
          if (success) setSuccess(undefined)
        }}
        placeholder="Share your thoughts..."
        disabled={isSubmitting}
        maxLength={1000}
        minHeight={96}
      />

      <Flex direction="column" gap="x2">
        {error && (
          <Text variant="paragraph-sm" className={commentFormError}>
            {error}
          </Text>
        )}

        {success && (
          <Text variant="paragraph-sm" className={commentFormSuccess}>
            {success}
          </Text>
        )}

        <ContractButton
          handleClick={handleComment}
          chainId={chainId}
          disabled={!commentText.trim() || isSubmitting}
          loading={isSubmitting}
          style={{ width: '100%' }}
          size="sm"
        >
          {isSubmitting ? 'Posting Comment...' : 'Post Comment'}
        </ContractButton>
      </Flex>
    </Box>
  )
}
