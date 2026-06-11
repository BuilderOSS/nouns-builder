import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useGenerateMerkleRoots } from '../../../hooks/useGenerateMerkleRoots'
import { useSetMerkleRoots } from '../../../hooks/useSetMerkleRoots'

enum SetupPhase {
  GENERATE = 'generate',
  SET_ROOTS = 'set_roots',
  COMPLETE = 'complete',
}

export const Step5_SetupMerkleRoots: React.FC = () => {
  const {
    sourceChainId,
    sourceAddresses,
    sourceConfig,
    targetChainId,
    targetAddresses,
    setAttributesMerkleRoot,
    setMembersMerkleRoot,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const [phase, setPhase] = useState<SetupPhase>(SetupPhase.GENERATE)

  const {
    attributesData,
    attributesMerkleRoot,
    generateAttributesRoot,
    isGeneratingAttributes,
    memberSnapshot,
    memberMerkleRoot,
    generateMemberRoot,
    isGeneratingMembers,
    error: generateError,
  } = useGenerateMerkleRoots(
    sourceAddresses?.token,
    sourceAddresses?.metadata,
    sourceConfig?.currentTokenId,
    sourceChainId
  )

  const {
    setAttributesRoot,
    setMintSettings,
    isSettingRoots,
    attributesTxHash,
    membersTxHash,
    error: setError,
  } = useSetMerkleRoots(targetAddresses?.metadata, targetAddresses?.token, targetChainId)

  const handleGenerate = async () => {
    try {
      const [attributesResult, memberResult] = await Promise.all([
        generateAttributesRoot(),
        generateMemberRoot(),
      ])

      if (attributesResult && memberResult) {
        setPhase(SetupPhase.SET_ROOTS)
      }
    } catch (err) {
      console.error('Error generating merkle roots:', err)
    }
  }

  const handleSetRoots = async () => {
    if (!attributesMerkleRoot || !memberMerkleRoot) {
      return
    }

    try {
      await Promise.all([
        setAttributesRoot(attributesMerkleRoot),
        setMintSettings(memberMerkleRoot),
      ])

      // Save to context
      setAttributesMerkleRoot(attributesMerkleRoot)
      setMembersMerkleRoot(memberMerkleRoot)

      setPhase(SetupPhase.COMPLETE)
    } catch (err) {
      console.error('Error setting merkle roots:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  const error = generateError || setError

  if (error) {
    return (
      <Stack gap="x4">
        <Heading size="md">Error with Merkle Roots</Heading>
        <Text color="negative">{error}</Text>
        <Flex justify="space-between">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
          <Button
            onClick={phase === SetupPhase.GENERATE ? handleGenerate : handleSetRoots}
          >
            Retry
          </Button>
        </Flex>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 5: Setup Merkle Roots
        </Heading>
        <Text color="text3">
          Generate merkle roots for attributes and member tokens, then set them on the
          target contracts.
        </Text>
      </Box>

      {/* Phase 1: Generate */}
      {phase === SetupPhase.GENERATE && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="background2">
            <Heading size="xs" mb="x3">
              What will be generated:
            </Heading>
            <Stack gap="x3">
              <Box>
                <Text fontWeight="label" mb="x1">
                  1. Attributes Merkle Root
                </Text>
                <Text fontSize={14} color="text3">
                  For all token attributes/properties from tokens 0 to{' '}
                  {sourceConfig?.currentTokenId.toString()}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="label" mb="x1">
                  2. Member Merkle Root
                </Text>
                <Text fontSize={14} color="text3">
                  For all current token holders and their token IDs (snapshot)
                </Text>
              </Box>
            </Stack>
          </Box>

          <Flex justify="center">
            <Button
              onClick={handleGenerate}
              disabled={isGeneratingAttributes || isGeneratingMembers}
              loading={isGeneratingAttributes || isGeneratingMembers}
            >
              {isGeneratingAttributes || isGeneratingMembers
                ? 'Generating Merkle Roots...'
                : 'Generate Merkle Roots'}
            </Button>
          </Flex>
        </>
      )}

      {/* Phase 2: Set Roots */}
      {phase === SetupPhase.SET_ROOTS && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ Merkle Roots Generated!
            </Heading>
          </Box>

          <Stack gap="x4">
            <Box p="x4" borderRadius="curved" backgroundColor="background2">
              <Heading size="xs" mb="x3">
                Attributes Merkle Root
              </Heading>
              <Stack gap="x2">
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Tokens with attributes:
                  </Text>
                  <Text fontSize={14}>{attributesData?.length || 0}</Text>
                </Flex>
                <Box mt="x2">
                  <Text color="text3" fontSize={12} mb="x1">
                    Root Hash:
                  </Text>
                  <Text
                    fontFamily="mono"
                    fontSize={12}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {attributesMerkleRoot}
                  </Text>
                </Box>
              </Stack>
            </Box>

            <Box p="x4" borderRadius="curved" backgroundColor="background2">
              <Heading size="xs" mb="x3">
                Member Merkle Root
              </Heading>
              <Stack gap="x2">
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Token holders:
                  </Text>
                  <Text fontSize={14}>{memberSnapshot?.length || 0}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Total tokens:
                  </Text>
                  <Text fontSize={14}>
                    {memberSnapshot?.reduce((sum, m) => sum + m.tokens.length, 0) || 0}
                  </Text>
                </Flex>
                <Box mt="x2">
                  <Text color="text3" fontSize={12} mb="x1">
                    Root Hash:
                  </Text>
                  <Text
                    fontFamily="mono"
                    fontSize={12}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {memberMerkleRoot}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <Box p="x4" borderRadius="curved" backgroundColor="warning">
            <Text color="onWarning">
              Next: Set these roots on the target contracts. This will execute 2
              transactions.
            </Text>
          </Box>

          <Flex justify="center">
            <Button
              onClick={handleSetRoots}
              disabled={isSettingRoots}
              loading={isSettingRoots}
            >
              {isSettingRoots ? 'Setting Merkle Roots...' : 'Set Merkle Roots'}
            </Button>
          </Flex>
        </>
      )}

      {/* Phase 3: Complete */}
      {phase === SetupPhase.COMPLETE && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ Merkle Roots Set Successfully!
            </Heading>
            <Text color="onPositive">
              Both attribute and member merkle roots have been configured on the target
              contracts.
            </Text>
          </Box>

          {(attributesTxHash || membersTxHash) && (
            <Box p="x4" borderRadius="curved" backgroundColor="background2">
              <Heading size="xs" mb="x3">
                Transaction Hashes
              </Heading>
              <Stack gap="x3">
                {attributesTxHash && (
                  <Box>
                    <Text fontSize={12} color="text3" mb="x1">
                      Attributes Root (setAttributeMerkleRoot):
                    </Text>
                    <Text
                      fontFamily="mono"
                      fontSize={11}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {attributesTxHash}
                    </Text>
                  </Box>
                )}
                {membersTxHash && (
                  <Box>
                    <Text fontSize={12} color="text3" mb="x1">
                      Member Root (setMintSettings):
                    </Text>
                    <Text
                      fontFamily="mono"
                      fontSize={11}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {membersTxHash}
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          <Flex justify="flex-end">
            <Button onClick={handleContinue}>Continue to Token Minting</Button>
          </Flex>
        </>
      )}

      {phase === SetupPhase.GENERATE && (
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
        </Flex>
      )}
    </Stack>
  )
}
