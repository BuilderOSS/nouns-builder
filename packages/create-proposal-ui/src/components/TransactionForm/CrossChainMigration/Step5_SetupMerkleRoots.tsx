import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useEffect, useState } from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useGenerateMerkleRoots } from '../../../hooks/useGenerateMerkleRoots'
import { useSetMerkleRoots } from '../../../hooks/useSetMerkleRoots'
import { prepareMemberMerkleRoot } from '../../../utils/prepareMemberMerkleRoot'
import { MemberListEditor } from './MemberListEditor'

enum SetupPhase {
  GENERATE = 'generate',
  EDIT = 'edit',
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
    merkleRootsPhase: cachedPhase,
    merkleRoots: cachedMerkleRoots,
    memberSnapshot: storedMemberSnapshot,
    setMerkleRootsPhase,
    setAttributesMerkleRoot,
    setMembersMerkleRoot,
    setAttributesData,
    setMemberSnapshot,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const [phase, setPhase] = useState<SetupPhase>(
    (cachedPhase as SetupPhase) || SetupPhase.GENERATE
  )

  // Save phase to Zustand whenever it changes
  useEffect(() => {
    setMerkleRootsPhase(phase)
  }, [phase, setMerkleRootsPhase])

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

  // Save attributes data and member snapshot to Zustand when available
  useEffect(() => {
    if (attributesData) {
      setAttributesData(attributesData)
    }
  }, [attributesData, setAttributesData])

  useEffect(() => {
    if (memberSnapshot) {
      setMemberSnapshot(memberSnapshot)
    }
  }, [memberSnapshot, setMemberSnapshot])

  // Save merkle roots to Zustand when generated
  useEffect(() => {
    if (attributesMerkleRoot) {
      setAttributesMerkleRoot(attributesMerkleRoot)
    }
  }, [attributesMerkleRoot, setAttributesMerkleRoot])

  useEffect(() => {
    if (memberMerkleRoot) {
      setMembersMerkleRoot(memberMerkleRoot)
    }
  }, [memberMerkleRoot, setMembersMerkleRoot])

  // Prioritize Zustand cache over SWR (important after editing)
  // If we have a cached root in Zustand, it means it was either:
  // 1. Just generated and saved, OR
  // 2. Regenerated after editing
  // So Zustand cache should take priority over SWR
  const activeAttributesRoot = cachedMerkleRoots?.attributes || attributesMerkleRoot
  const activeMemberRoot = cachedMerkleRoots?.members || memberMerkleRoot

  // Use stored snapshot if available (after editing), otherwise use generated snapshot
  const activeMemberSnapshot = storedMemberSnapshot || memberSnapshot

  const {
    setAttributesRoot,
    setMintSettings,
    isSettingRoots,
    attributesTxHash,
    membersTxHash,
    error: setError,
  } = useSetMerkleRoots(targetAddresses?.metadata, targetAddresses?.token, targetChainId)

  const handleGenerate = () => {
    try {
      // Trigger both fetches
      generateAttributesRoot()
      generateMemberRoot()
      // Data will be available via SWR, and useEffect will handle phase transition
    } catch (err) {
      console.error('Error generating merkle roots:', err)
    }
  }

  // Auto-advance to EDIT phase when both merkle roots are available
  useEffect(() => {
    if (
      phase === SetupPhase.GENERATE &&
      activeAttributesRoot &&
      activeMemberRoot &&
      !isGeneratingAttributes &&
      !isGeneratingMembers
    ) {
      setPhase(SetupPhase.EDIT)
    }
  }, [
    phase,
    activeAttributesRoot,
    activeMemberRoot,
    isGeneratingAttributes,
    isGeneratingMembers,
  ])

  // Phase validation: Reset to GENERATE if phase is advanced but roots are missing
  // This handles cases where page was refreshed and cached phase is stale
  useEffect(() => {
    if (
      (phase === SetupPhase.EDIT || phase === SetupPhase.SET_ROOTS) &&
      (!activeAttributesRoot || !activeMemberRoot) &&
      !isGeneratingAttributes &&
      !isGeneratingMembers
    ) {
      console.warn(
        '[Step5] Phase is advanced but merkle roots are missing. Resetting to GENERATE phase.'
      )
      setPhase(SetupPhase.GENERATE)
    }
  }, [
    phase,
    activeAttributesRoot,
    activeMemberRoot,
    isGeneratingAttributes,
    isGeneratingMembers,
  ])

  const handleSetRoots = async () => {
    if (!activeAttributesRoot || !activeMemberRoot) {
      return
    }

    try {
      // Serialize transactions to avoid nonce issues
      await setAttributesRoot(activeAttributesRoot)
      await setMintSettings(activeMemberRoot)

      // Save to context (in case they came from cache and weren't already saved)
      setAttributesMerkleRoot(activeAttributesRoot)
      setMembersMerkleRoot(activeMemberRoot)

      // Wait for blockchain state to settle before proceeding
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setPhase(SetupPhase.COMPLETE)
    } catch (err) {
      console.error('Error setting merkle roots:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  const handleEditContinue = async (editedMembers: any[]) => {
    try {
      // Regenerate member merkle root from edited data
      const newMemberRoot = await prepareMemberMerkleRoot(editedMembers)

      // Save edited data and new root to store
      setMemberSnapshot(editedMembers)
      setMembersMerkleRoot(newMemberRoot)

      // Advance to SET_ROOTS phase
      setPhase(SetupPhase.SET_ROOTS)
    } catch (err) {
      console.error('Error regenerating merkle root:', err)
    }
  }

  const handleEditSkip = () => {
    setPhase(SetupPhase.SET_ROOTS)
  }

  const handleReset = () => {
    // Clear all merkle root state and reset to GENERATE phase
    setAttributesMerkleRoot(undefined as any)
    setMembersMerkleRoot(undefined as any)
    setAttributesData(undefined as any)
    setMemberSnapshot(undefined as any)
    setMerkleRootsPhase('generate')
    setPhase(SetupPhase.GENERATE)
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

          <Flex justify="space-between">
            <Button variant="secondary" onClick={goToPreviousStep}>
              Back
            </Button>
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

      {/* Phase 2: Edit Members */}
      {phase === SetupPhase.EDIT && activeMemberSnapshot && (
        <>
          {/* Display generated roots */}
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
                    {activeAttributesRoot}
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
                  <Text fontSize={14}>{activeMemberSnapshot?.length || 0}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Total tokens:
                  </Text>
                  <Text fontSize={14}>
                    {activeMemberSnapshot?.reduce((sum, m) => sum + m.tokens.length, 0) ||
                      0}
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
                    {activeMemberRoot}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>

          <MemberListEditor
            initialMembers={activeMemberSnapshot}
            reservedUntilTokenId={sourceConfig?.reservedUntilTokenId || 0n}
            onContinue={handleEditContinue}
            onSkip={handleEditSkip}
          />
        </>
      )}

      {/* Phase 3: Set Roots */}
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
                    {activeAttributesRoot}
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
                  <Text fontSize={14}>{activeMemberSnapshot?.length || 0}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Total tokens:
                  </Text>
                  <Text fontSize={14}>
                    {activeMemberSnapshot?.reduce((sum, m) => sum + m.tokens.length, 0) ||
                      0}
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
                    {activeMemberRoot}
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

          <Flex justify="space-between">
            <Button variant="secondary" onClick={handleReset}>
              Reset & Regenerate
            </Button>
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

          {/* Display the merkle roots */}
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
                    {activeAttributesRoot}
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
                  <Text fontSize={14}>{activeMemberSnapshot?.length || 0}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text color="text3" fontSize={14}>
                    Total tokens:
                  </Text>
                  <Text fontSize={14}>
                    {activeMemberSnapshot?.reduce((sum, m) => sum + m.tokens.length, 0) ||
                      0}
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
                    {activeMemberRoot}
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>

          {(attributesTxHash || membersTxHash) && targetChainId && (
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
                      as="a"
                      href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${attributesTxHash}`}
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
                      as="a"
                      href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${membersTxHash}`}
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
                      {membersTxHash}
                    </Text>
                  </Box>
                )}
              </Stack>
            </Box>
          )}

          <Flex justify="space-between">
            <Button variant="secondary" onClick={handleReset}>
              Reset & Regenerate
            </Button>
            <Button onClick={handleContinue}>Continue to Delayed Governance</Button>
          </Flex>
        </>
      )}
    </Stack>
  )
}
