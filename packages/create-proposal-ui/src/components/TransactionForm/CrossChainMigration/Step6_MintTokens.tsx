import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useMintReservedTokens } from '../../../hooks/useMintReservedTokens'

export const Step6_MintTokens: React.FC = () => {
  const {
    targetChainId,
    targetAddresses,
    memberSnapshot,
    mintingProgress,
    addMintedTokens,
    addMintingTxHash,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const {
    startMinting,
    isMinting,
    totalTokens,
    tokensMinted,
    progress,
    txHashes,
    error,
  } = useMintReservedTokens(
    memberSnapshot,
    targetAddresses?.token,
    targetChainId,
    mintingProgress.minted,
    addMintedTokens,
    addMintingTxHash
  )

  const handleStartMinting = async () => {
    try {
      await startMinting()
    } catch (err) {
      console.error('Error minting tokens:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
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
    return (
      <Stack gap="x4">
        <Heading size="md">Error Minting Tokens</Heading>
        <Text color="negative">{error}</Text>
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Tokens minted before error: {tokensMinted.length} / {totalTokens}
          </Text>
        </Box>
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
          Step 6: Mint Reserved Tokens
        </Heading>
        <Text color="text3">
          Batch mint all reserved tokens to their original owners using merkle proofs.
          This will execute multiple transactions in batches of 15 tokens.
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
            <Text fontWeight="label">15 tokens per transaction</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Estimated Transactions:</Text>
            <Text fontWeight="label">
              {Math.ceil(
                memberSnapshot.reduce((sum, m) => sum + m.tokens.length, 0) / 15
              )}
            </Text>
          </Flex>
        </Stack>
      </Box>

      {!isComplete && !isMinting && tokensMinted.length === 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="warning">
          <Text color="onWarning">
            ⚠️ This process will execute multiple transactions. Please do not close this
            window until minting is complete.
          </Text>
        </Box>
      )}

      {!isComplete && (
        <Flex justify="center">
          <Button onClick={handleStartMinting} disabled={isMinting} loading={isMinting}>
            {isMinting
              ? `Minting... (${tokensMinted.length}/${totalTokens})`
              : 'Start Batch Minting'}
          </Button>
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
                height="12px"
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
