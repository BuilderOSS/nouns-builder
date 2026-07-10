import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import {
  DEFAULT_ATTRIBUTES_BATCH_SIZE,
  useSetAttributes,
} from '../../../hooks/useSetAttributes'

export const Step7_SetAttributes: React.FC = () => {
  const {
    targetChainId,
    targetAddresses,
    attributesData,
    merkleRoots,
    addAttributeSettingTxHash,
    updateAttributesSet,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const [batchSize, setBatchSize] = useState(DEFAULT_ATTRIBUTES_BATCH_SIZE)

  const {
    setAllAttributes,
    isSettingAttributes,
    txHashes,
    tokensSet,
    totalTokens,
    error,
    clearError,
  } = useSetAttributes(
    targetAddresses?.metadata,
    targetChainId,
    attributesData,
    merkleRoots?.attributes
  )

  const handleSetAttributes = async () => {
    try {
      const hashes = await setAllAttributes()
      if (hashes) {
        // Update progress in Zustand
        hashes.forEach((hash) => addAttributeSettingTxHash(hash))
        updateAttributesSet(tokensSet)
      }
    } catch (err) {
      console.error('Error setting attributes:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  const handleBatchSizeChange = (newSize: number) => {
    setBatchSize(newSize)
    clearError()
  }

  const isComplete = tokensSet > 0 && tokensSet === totalTokens

  if (!attributesData || attributesData.length === 0) {
    return (
      <Stack gap="x4">
        <Heading size="md">No Attribute Data Available</Heading>
        <Text color="text3">
          Please go back to Step 5 to generate the attributes merkle root and data.
        </Text>
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back to Merkle Roots
          </Button>
        </Flex>
      </Stack>
    )
  }

  if (!merkleRoots?.attributes) {
    return (
      <Stack gap="x4">
        <Heading size="md">Attributes Merkle Root Not Set</Heading>
        <Text color="text3">
          The attributes merkle root must be set on-chain in Step 5 before setting
          individual token attributes.
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
        <Heading size="md">Error Setting Attributes</Heading>
        <Text color="negative">{error}</Text>
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Attributes set before error: {tokensSet} / {totalTokens}
          </Text>
        </Box>
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Batch Size Configuration
          </Heading>
          <Stack gap="x3">
            <Box>
              <Label mb="x2">Tokens per Transaction: {batchSize}</Label>
              <Flex gap="x2" wrap="wrap">
                {[
                  DEFAULT_ATTRIBUTES_BATCH_SIZE,
                  Math.floor(DEFAULT_ATTRIBUTES_BATCH_SIZE / 2),
                  Math.floor(DEFAULT_ATTRIBUTES_BATCH_SIZE / 4),
                ]
                  .filter((v, i, arr) => v >= 1 && arr.indexOf(v) === i)
                  .map((size) => (
                    <Button
                      key={size}
                      variant={batchSize === size ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleBatchSizeChange(size)}
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
                  disabled={batchSize <= 1}
                >
                  Half ({Math.max(1, Math.floor(batchSize / 2))})
                </Button>
              </Flex>
            </Box>
            <Text fontSize={12} color="text3">
              Attribute setting requires merkle proofs for each token, which can be
              gas-intensive. Start with a smaller batch size if you encounter errors.
            </Text>
          </Stack>
        </Box>
        <Flex justify="space-between">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
          <Button onClick={handleSetAttributes}>Retry Setting Attributes</Button>
        </Flex>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 7: Set Token Attributes On-Chain
        </Heading>
        <Text color="text3">
          Set attributes for all tokens on-chain before minting. This ensures migrated
          tokens preserve their exact attributes from the source chain instead of
          generating random ones.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="warning" color="background1">
        <Heading size="xs" mb="x2">
          Important: Attributes Must Be Set Before Minting
        </Heading>
        <Text fontSize={14}>
          When tokens are minted, the contract checks if attributes are already stored
          on-chain. If not, it generates random attributes. To preserve migration data, we
          must set attributes BEFORE minting in the next step.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Attribute Setting Summary
        </Heading>
        <Stack gap="x2">
          <Flex justify="space-between">
            <Text color="text3">Total Tokens with Attributes:</Text>
            <Text fontWeight="label">{attributesData.length}</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Batch Size:</Text>
            <Text fontWeight="label">{batchSize} tokens per transaction</Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Estimated Transactions:</Text>
            <Text fontWeight="label">{Math.ceil(attributesData.length / batchSize)}</Text>
          </Flex>
          {merkleRoots.attributes && (
            <Box mt="x2">
              <Text color="text3" fontSize={12} mb="x1">
                Attributes Merkle Root:
              </Text>
              <Text
                fontFamily="mono"
                fontSize={12}
                style={{ wordBreak: 'break-all' }}
                color="text3"
              >
                {merkleRoots.attributes}
              </Text>
            </Box>
          )}
        </Stack>
      </Box>

      {isSettingAttributes && (
        <Box p="x4" borderRadius="curved" backgroundColor="positive">
          <Heading size="xs" mb="x2" color="onPositive">
            Setting Attributes...
          </Heading>
          <Text color="onPositive">
            Progress: {tokensSet} / {totalTokens} tokens
          </Text>
          <Text fontSize={14} color="onPositive" mt="x2">
            Please wait while attributes are set in batches. Do not close this window.
          </Text>
        </Box>
      )}

      {isComplete && (
        <Box p="x4" borderRadius="curved" backgroundColor="positive">
          <Heading size="xs" mb="x2" color="onPositive">
            All Attributes Set Successfully!
          </Heading>
          <Text color="onPositive">
            {tokensSet} token attributes have been stored on-chain.
          </Text>
        </Box>
      )}

      {txHashes.length > 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Transaction Hashes ({txHashes.length})
          </Heading>
          <Stack gap="x2">
            {txHashes.map((hash, index) => (
              <Box key={hash}>
                <Text fontSize={12} color="text3" mb="x1">
                  Batch {index + 1}:
                </Text>
                <a
                  href={`${ETHERSCAN_BASE_URL[targetChainId!]}/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ wordBreak: 'break-all' }}
                >
                  <Text fontSize={12} fontFamily="mono" color="accent">
                    {hash}
                  </Text>
                </a>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Flex justify="space-between">
        <Button
          variant="secondary"
          onClick={goToPreviousStep}
          disabled={isSettingAttributes}
        >
          Back
        </Button>
        {isComplete ? (
          <Button onClick={handleContinue}>Continue to Token Minting</Button>
        ) : (
          <Button onClick={handleSetAttributes} disabled={isSettingAttributes}>
            {isSettingAttributes ? 'Setting Attributes...' : 'Start Setting Attributes'}
          </Button>
        )}
      </Flex>
    </Stack>
  )
}
