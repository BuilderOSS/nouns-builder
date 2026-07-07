import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import { useAuthorizeMinter } from '../../../hooks/useAuthorizeMinter'
import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import {
  DEFAULT_BATCH_SIZE,
  useMintReservedTokens,
} from '../../../hooks/useMintReservedTokens'

export const Step7_MintTokens: React.FC = () => {
  const {
    targetChainId,
    targetAddresses,
    memberSnapshot,
    merkleRoots,
    mintingProgress,
    addMintedTokens,
    addMintingTxHash,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const [batchSize, setBatchSize] = useState(DEFAULT_BATCH_SIZE)

  const {
    authorizeMinter,
    isAuthorizing,
    isMinterAuthorized,
    authorizeTxHash,
    error: authError,
    minterAddress,
  } = useAuthorizeMinter(targetAddresses?.token, targetChainId)

  const {
    startMinting,
    isMinting,
    totalTokens,
    tokensMinted,
    progress,
    txHashes,
    error,
    onChainMerkleRoot,
    refetchOnChainRoot,
    clearError,
  } = useMintReservedTokens(
    memberSnapshot,
    targetAddresses?.token,
    targetChainId,
    mintingProgress.minted,
    addMintedTokens,
    addMintingTxHash,
    batchSize
  )

  const handleStartMinting = async () => {
    try {
      await startMinting()
    } catch (err) {
      console.error('Error minting tokens:', err)
    }
  }

  const handleAuthorizeMinter = async () => {
    try {
      await authorizeMinter()
    } catch (err) {
      console.error('Error authorizing minter:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  const handleBatchSizeChange = (newSize: number) => {
    setBatchSize(newSize)
    clearError() // Clear any errors when user changes batch size
  }

  const handleRefreshRoot = async () => {
    await refetchOnChainRoot()
    clearError() // Clear any errors after refreshing root
  }

  const isComplete = tokensMinted.length > 0 && tokensMinted.length === totalTokens

  if (!memberSnapshot || memberSnapshot.length === 0) {
    return (
      <Stack gap="x4">
        <Heading size="md">No Member Snapshot Available</Heading>
        <Text color="text3">
          Please go back to Step 5 to generate the member merkle root and snapshot.
        </Text>
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back to Merkle Roots
          </Button>
        </Flex>
      </Stack>
    )
  }

  if (error) {
    const isGasEstimationError = error.includes('Gas estimation failed')
    return (
      <Stack gap="x4">
        <Heading size="md">Error Minting Tokens</Heading>
        <Text color="negative">{error}</Text>
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Tokens minted before error: {tokensMinted.length} / {totalTokens}
          </Text>
        </Box>
        {isGasEstimationError && (
          <Box p="x4" borderRadius="curved" backgroundColor="warning">
            <Heading size="xs" mb="x2" color="onWarning">
              Try Reducing Batch Size
            </Heading>
            <Stack gap="x2">
              <Text fontSize={14} color="onWarning">
                Current batch size: {batchSize} tokens
              </Text>
              <Text fontSize={14} color="onWarning">
                Try reducing to: {Math.max(1, Math.floor(batchSize / 2))} tokens
              </Text>
            </Stack>
          </Box>
        )}
        <Flex justify="space-between">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
          <Button onClick={handleStartMinting}>Retry Minting</Button>
        </Flex>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 7: Mint Reserved Tokens
        </Heading>
        <Text color="text3">
          Batch mint all reserved tokens to their original owners using merkle proofs.
          This will execute multiple transactions in batches.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Minting Summary
        </Heading>
        <Stack gap="x2">
          <Flex justify="space-between">
            <Text color="text3">Token Holders:</Text>
            <Text fontWeight="label">{memberSnapshot.length}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Total Tokens to Mint:</Text>
            <Text fontWeight="label">
              {memberSnapshot.reduce((sum, m) => sum + m.tokens.length, 0)}
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Batch Size:</Text>
            <Text fontWeight="label">{batchSize} tokens per transaction</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Estimated Transactions:</Text>
            <Text fontWeight="label">
              {Math.ceil(
                memberSnapshot.reduce((sum, m) => sum + m.tokens.length, 0) / batchSize
              )}
            </Text>
          </Flex>
        </Stack>
      </Box>

      {/* Batch Size Configuration - Only show when error occurs or minting started */}
      {!isComplete && (error || tokensMinted.length > 0) && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Batch Size Configuration
          </Heading>
          <Stack gap="x3">
            <Box>
              <Label mb="x2">Tokens per Transaction: {batchSize}</Label>
              <Flex gap="x2" wrap="wrap">
                {[50, 25, 10, 5].map((size) => (
                  <Button
                    key={size}
                    variant={batchSize === size ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleBatchSizeChange(size)}
                    disabled={isMinting}
                  >
                    {size}
                  </Button>
                ))}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    handleBatchSizeChange(Math.max(1, Math.floor(batchSize / 2)))
                  }
                  disabled={isMinting || batchSize <= 1}
                >
                  Half ({Math.max(1, Math.floor(batchSize / 2))})
                </Button>
              </Flex>
            </Box>
            <Text fontSize={12} color="text3">
              Larger batches are more efficient but require more gas. If gas estimation
              fails, try a smaller batch size. Recommended: 25-50 tokens per batch.
            </Text>
          </Stack>
        </Box>
      )}

      {/* Minter Authorization */}
      <Box
        p="x4"
        borderRadius="curved"
        backgroundColor={
          isMinterAuthorized ? 'positive' : authError ? 'negative' : 'background2'
        }
      >
        <Heading size="xs" mb="x3" color={isMinterAuthorized ? 'onPositive' : undefined}>
          {isMinterAuthorized ? '✓ ' : ''}Minter Authorization
        </Heading>
        <Stack gap="x3">
          <Box>
            <Text
              fontSize={12}
              color={isMinterAuthorized ? 'onPositive' : 'text3'}
              mb="x1"
            >
              MerkleReserveMinter Address:
            </Text>
            <Text
              fontFamily="mono"
              fontSize={12}
              style={{ wordBreak: 'break-all' }}
              color={isMinterAuthorized ? 'onPositive' : undefined}
            >
              {minterAddress}
            </Text>
          </Box>

          <Box>
            <Text
              fontSize={12}
              color={isMinterAuthorized ? 'onPositive' : 'text3'}
              mb="x1"
            >
              Status:
            </Text>
            <Text
              fontSize={14}
              fontWeight="label"
              color={isMinterAuthorized ? 'onPositive' : undefined}
            >
              {isMinterAuthorized === undefined
                ? 'Checking...'
                : isMinterAuthorized
                  ? 'Authorized - Ready to mint'
                  : 'Not Authorized - Must authorize before minting'}
            </Text>
          </Box>

          {authError && (
            <Text fontSize={14} color="negative">
              {authError}
            </Text>
          )}

          {authorizeTxHash && targetChainId && (
            <Box>
              <Text fontSize={12} color="text3" mb="x1">
                Authorization Transaction:
              </Text>
              <Text
                as="a"
                href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${authorizeTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                fontFamily="mono"
                fontSize={12}
                color="accent"
                style={{
                  wordBreak: 'break-all',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                {authorizeTxHash}
              </Text>
            </Box>
          )}

          {!isMinterAuthorized && !isAuthorizing && (
            <Button onClick={handleAuthorizeMinter} disabled={isAuthorizing}>
              Authorize MerkleReserveMinter
            </Button>
          )}

          {isAuthorizing && (
            <Button disabled loading>
              Authorizing...
            </Button>
          )}
        </Stack>
      </Box>

      {/* Merkle Root Debug - Only show when there's a mismatch error */}
      {memberSnapshot &&
        merkleRoots?.members &&
        error &&
        error.includes('Merkle root mismatch') && (
          <Box p="x4" borderRadius="curved" backgroundColor="background2">
            <Heading size="xs" mb="x3">
              Debug: Merkle Root Verification
            </Heading>
            <Stack gap="x3">
              <Box>
                <Text fontSize={12} color="text3" mb="x1">
                  Expected Merkle Root (from Step 5 - Zustand state):
                </Text>
                <Text fontFamily="mono" fontSize={12} style={{ wordBreak: 'break-all' }}>
                  {merkleRoots.members}
                </Text>
              </Box>
              {onChainMerkleRoot && (
                <Box>
                  <Text fontSize={12} color="text3" mb="x1">
                    On-Chain Merkle Root (from MerkleReserveMinter contract):
                  </Text>
                  <Text
                    fontFamily="mono"
                    fontSize={12}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {onChainMerkleRoot}
                  </Text>
                  {onChainMerkleRoot !== merkleRoots.members && (
                    <Text fontSize={12} color="negative" mt="x1">
                      ⚠️ MISMATCH: On-chain root differs from expected root!
                    </Text>
                  )}
                </Box>
              )}
              <Box>
                <Text fontSize={12} color="text3" mb="x1">
                  Snapshot Info:
                </Text>
                <Text fontSize={12}>
                  {memberSnapshot.length} members,{' '}
                  {memberSnapshot.reduce((sum, m) => sum + m.tokens.length, 0)} total
                  tokens
                </Text>
              </Box>
              <Button variant="secondary" size="sm" onClick={handleRefreshRoot}>
                Refresh On-Chain Root
              </Button>
              <Text fontSize={12} color="text4">
                If the mismatch persists after refreshing, go back to Step 5 and use the
                "Reset & Regenerate" button.
              </Text>
            </Stack>
          </Box>
        )}

      {!isComplete && !isMinting && tokensMinted.length === 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="warning">
          <Text color="onWarning">
            ⚠️ This process will execute multiple transactions. Please do not close this
            window until minting is complete.
          </Text>
        </Box>
      )}

      {!isComplete && (
        <Flex justify="center" direction="column" gap="x2" align="center">
          <Button
            onClick={handleStartMinting}
            disabled={isMinting || !isMinterAuthorized}
            loading={isMinting}
          >
            {isMinting
              ? `Minting... (${tokensMinted.length}/${totalTokens})`
              : 'Start Batch Minting'}
          </Button>
          {!isMinterAuthorized && !isMinting && (
            <Text fontSize={12} color="text3">
              Please authorize the minter above before starting minting
            </Text>
          )}
        </Flex>
      )}

      {(isMinting || tokensMinted.length > 0) && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Minting Progress
          </Heading>
          <Stack gap="x3">
            <Box>
              <Flex justify="space-between" mb="x2">
                <Text fontSize={14} color="text3">
                  Tokens Minted
                </Text>
                <Text fontSize={14} fontWeight="label">
                  {tokensMinted.length} / {totalTokens}
                </Text>
              </Flex>
              <Box
                backgroundColor="background1"
                height="x3"
                borderRadius="curved"
                overflow="hidden"
              >
                <Box
                  backgroundColor="accent"
                  height="100%"
                  style={{
                    width: `${progress}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Text fontSize={12} color="text3" mt="x1" textAlign="right">
                {progress.toFixed(1)}%
              </Text>
            </Box>

            {txHashes.length > 0 && targetChainId && (
              <Box mt="x2">
                <Text fontSize={12} color="text3" mb="x2">
                  Batch Transactions ({txHashes.length}):
                </Text>
                <Stack gap="x2" maxHeight="200px" style={{ overflowY: 'auto' }}>
                  {txHashes.map((hash, idx) => (
                    <Box
                      key={hash}
                      p="x2"
                      borderRadius="curved"
                      backgroundColor="background1"
                    >
                      <Text fontSize={12} color="text3" mb="x1">
                        Batch {idx + 1}:
                      </Text>
                      <Text
                        as="a"
                        href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fontFamily="mono"
                        fontSize={12}
                        color="accent"
                        style={{
                          wordBreak: 'break-all',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        {hash}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      )}

      {isComplete && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ All Tokens Minted Successfully!
            </Heading>
            <Text color="onPositive">
              All {totalTokens} reserved tokens have been minted to their original owners.
            </Text>
          </Box>

          <Box p="x4" borderRadius="curved" backgroundColor="background2">
            <Heading size="xs" mb="x3">
              Minting Statistics
            </Heading>
            <Stack gap="x2" fontSize={14}>
              <Flex justify="space-between">
                <Text color="text3">Tokens Minted:</Text>
                <Text fontWeight="label">{tokensMinted.length}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="text3">Batch Transactions:</Text>
                <Text fontWeight="label">{txHashes.length}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="text3">Recipients:</Text>
                <Text fontWeight="label">{memberSnapshot.length}</Text>
              </Flex>
            </Stack>
          </Box>

          <Flex justify="flex-end">
            <Button onClick={handleContinue}>Continue to Set Attributes</Button>
          </Flex>
        </>
      )}

      {!isComplete && !isMinting && tokensMinted.length === 0 && (
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back to Merkle Roots
          </Button>
        </Flex>
      )}
    </Stack>
  )
}
