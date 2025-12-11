import { erc721RedeemMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, Chain } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Box, Flex, Text } from '@buildeross/zord'
import React, { useCallback, useMemo, useState } from 'react'
import { formatEther } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import {
  errorMessage,
  feeBreakdown,
  feeLabel,
  feeRow,
  feeValue,
  tokenIdInput as tokenIdInputStyle,
  tokenIdPreview,
  totalFee,
} from './ERC721RedeemMinterForm.css'
import { validateTokenIdInput } from './parseTokenIds'

interface MintingFormProps {
  chain: Chain
  minterAddress: AddressType
  tokenAddress: AddressType
  pricePerToken: bigint | undefined
}

export const MintingForm: React.FC<MintingFormProps> = ({
  chain,
  minterAddress,
  tokenAddress,
  pricePerToken,
}) => {
  const { address } = useAccount()
  const config = useConfig()
  const [tokenIdInput, setTokenIdInput] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [mintSuccess, setMintSuccess] = useState(false)

  const { error, tokenIds, isValid } = useMemo(
    () => validateTokenIdInput(tokenIdInput),
    [tokenIdInput]
  )

  const { data: totalFees } = useReadContract({
    abi: erc721RedeemMinterAbi,
    address: minterAddress,
    functionName: 'getTotalFeesForMint',
    args: [tokenAddress, BigInt(tokenIds.length)],
    chainId: chain.id,
    query: {
      enabled: tokenIds.length > 0,
    },
  })

  const totalFeesValue = useMemo(
    () => (totalFees as bigint | undefined) || 0n,
    [totalFees]
  )

  const handleMint = useCallback(async () => {
    if (!isValid || tokenIds.length === 0) return

    setIsMinting(true)
    setMintSuccess(false)

    try {
      const hash = await writeContract(config, {
        abi: erc721RedeemMinterAbi,
        address: minterAddress,
        functionName: 'mintFromReserve',
        args: [tokenAddress, tokenIds.map((id) => BigInt(id))],
        value: totalFeesValue,
        chainId: chain.id,
      })

      await waitForTransactionReceipt(config, { hash, chainId: chain.id })

      setMintSuccess(true)
      setTokenIdInput('')
    } catch (error) {
      console.error('Minting failed:', error)
    } finally {
      setIsMinting(false)
    }
  }, [chain.id, config, minterAddress, tokenAddress, tokenIds, totalFeesValue, isValid])

  const baseCost =
    pricePerToken && tokenIds.length > 0 ? pricePerToken * BigInt(tokenIds.length) : 0n
  const builderFee = totalFeesValue > baseCost ? totalFeesValue - baseCost : 0n

  return (
    <Flex direction="column">
      <Box mb="x4">
        <Text fontSize="14" color="text3" mb="x2">
          Enter Token IDs to redeem (comma-separated or ranges):
        </Text>
        <Text fontSize="12" color="text4" mb="x3">
          Examples: "1,2,3" or "1-10" or "1-5,10,15-20"
        </Text>
        <input
          className={tokenIdInputStyle}
          type="text"
          value={tokenIdInput}
          onChange={(e) => setTokenIdInput(e.target.value)}
          placeholder="e.g., 1-10, 15, 20-25"
        />
        {!isValid && tokenIdInput && <Box className={errorMessage}>{error}</Box>}
        {isValid && tokenIds.length > 0 && (
          <Box className={tokenIdPreview}>
            <Text fontSize="12" fontWeight="label" mb="x1">
              Token IDs ({tokenIds.length} total):
            </Text>
            <Text fontSize="12">{tokenIds.join(', ')}</Text>
          </Box>
        )}
      </Box>

      {isValid && tokenIds.length > 0 && (
        <Box className={feeBreakdown}>
          <Box className={feeRow}>
            <Box className={feeLabel}>Base Cost ({tokenIds.length} tokens)</Box>
            <Box className={feeValue}>{formatEther(baseCost)} ETH</Box>
          </Box>
          <Box className={feeRow}>
            <Box className={feeLabel}>Builder DAO Fee</Box>
            <Box className={feeValue}>{formatEther(builderFee)} ETH</Box>
          </Box>
          <Box className={totalFee}>
            <Box className={feeLabel} style={{ fontWeight: 700, fontSize: '16px' }}>
              Total Cost
            </Box>
            <Box className={feeValue} style={{ fontWeight: 700, fontSize: '16px' }}>
              {formatEther(totalFeesValue)} ETH
            </Box>
          </Box>
        </Box>
      )}

      {mintSuccess && (
        <Box mt="x4" p="x4" style={{ background: '#D4EDDA', borderRadius: '8px' }}>
          <Text color="text1" fontSize="14" fontWeight="label">
            ✓ Minting successful! Your tokens have been minted.
          </Text>
        </Box>
      )}

      <ContractButton
        handleClick={handleMint}
        disabled={!isValid || tokenIds.length === 0 || !address || isMinting}
        style={{ width: '100%', marginTop: '16px' }}
        variant="primary"
        chainId={chain.id}
      >
        {isMinting
          ? 'Minting...'
          : `Mint ${tokenIds.length || 0} Token${tokenIds.length === 1 ? '' : 's'}`}
      </ContractButton>

      {!address && (
        <Box mt="x2">
          <Text fontSize="14" color="text4" textAlign="center">
            Connect your wallet to mint
          </Text>
        </Box>
      )}
    </Flex>
  )
}
