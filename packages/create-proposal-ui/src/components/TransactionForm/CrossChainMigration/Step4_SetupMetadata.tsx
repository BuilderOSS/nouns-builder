import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useEffect } from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useSetupMetadata } from '../../../hooks/useSetupMetadata'

export const Step4_SetupMetadata: React.FC = () => {
  const {
    sourceChainId,
    targetChainId,
    sourceAddresses,
    targetAddresses,
    metadataProperties: cachedProperties,
    setMetadataProperties,
    updateMetadataProgress,
    addMetadataTxHash,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  const {
    properties,
    isLoadingProperties,
    addAllProperties,
    isAddingProperties,
    progress,
    txHashes,
    error,
  } = useSetupMetadata(
    sourceAddresses?.token,
    sourceAddresses?.metadata,
    targetAddresses?.metadata,
    sourceChainId,
    targetChainId,
    updateMetadataProgress,
    addMetadataTxHash
  )

  // Save fetched properties to Zustand for persistence
  useEffect(() => {
    if (properties && properties.length > 0 && !cachedProperties) {
      setMetadataProperties(properties)
    }
  }, [properties, cachedProperties, setMetadataProperties])

  // Use cached properties if SWR hasn't loaded yet (e.g., after page refresh)
  const activeProperties = properties || cachedProperties || []

  const currentProperty = progress.current
  const totalProperties = progress.total
  const isComplete =
    activeProperties.length > 0 &&
    currentProperty === totalProperties &&
    !isAddingProperties

  const handleAddProperties = async () => {
    try {
      await addAllProperties()
    } catch (err) {
      console.error('Error adding properties:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  if (error) {
    return (
      <Stack gap="x4">
        <Heading size="md">Error Setting Up Metadata</Heading>
        <Text color="negative">{error}</Text>
        <Text color="text3" fontSize={12}>
          SWR will automatically retry fetching the metadata.
        </Text>
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
        </Flex>
      </Stack>
    )
  }

  if (isLoadingProperties) {
    return (
      <Stack gap="x4">
        <Heading size="md">Loading Properties...</Heading>
        <Text color="text3">Fetching property configuration from source DAO...</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 4: Setup Metadata Properties
        </Heading>
        <Text color="text3">
          Add all property definitions to the metadata renderer on the target chain. This
          includes trait types, names, and values.
        </Text>
      </Box>

      {activeProperties.length > 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Property Groups to Add
          </Heading>
          <Stack gap="x2">
            <Flex justify="space-between">
              <Text color="text3">Total Property Groups:</Text>
              <Text fontWeight="label">{activeProperties.length}</Text>
            </Flex>
            <Text color="text4" fontSize={12} mt="x2">
              Each group will be added via a separate transaction using addProperties().
            </Text>
          </Stack>
        </Box>
      )}

      {!isComplete && activeProperties.length > 0 && (
        <Flex justify="center">
          <Button
            onClick={handleAddProperties}
            disabled={isAddingProperties}
            loading={isAddingProperties}
          >
            {isAddingProperties
              ? `Adding Properties (${currentProperty}/${totalProperties})...`
              : 'Add All Properties'}
          </Button>
        </Flex>
      )}

      {isAddingProperties && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Progress
          </Heading>
          <Stack gap="x3">
            <Box>
              <Flex justify="space-between" mb="x2">
                <Text fontSize={14} color="text3">
                  Adding property groups...
                </Text>
                <Text fontSize={14} fontWeight="label">
                  {currentProperty} / {totalProperties}
                </Text>
              </Flex>
              <Box
                backgroundColor="background1"
                height="x2"
                borderRadius="curved"
                overflow="hidden"
              >
                <Box
                  backgroundColor="accent"
                  height="100%"
                  style={{
                    width: `${totalProperties > 0 ? (currentProperty / totalProperties) * 100 : 0}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Box>
      )}

      {txHashes.length > 0 && targetChainId && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Heading size="xs" mb="x3">
            Transaction Hashes ({txHashes.length})
          </Heading>
          <Stack gap="x2">
            {txHashes.map((hash, idx) => (
              <Box key={hash}>
                <Text fontSize={12} color="text3" mb="x1">
                  Group {idx + 1}:
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

      {isComplete && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ Metadata Setup Complete!
            </Heading>
            <Text color="onPositive">
              All {totalProperties} property groups have been added to the metadata
              renderer.
            </Text>
          </Box>

          <Flex justify="flex-end">
            <Button onClick={handleContinue}>Continue to Merkle Root Setup</Button>
          </Flex>
        </>
      )}

      {!isComplete &&
        !isAddingProperties &&
        !isLoadingProperties &&
        activeProperties.length === 0 && (
          <>
            <Box p="x4" borderRadius="curved" backgroundColor="warning">
              <Text color="onWarning">
                ℹ️ No properties found on source DAO. You can skip this step.
              </Text>
            </Box>

            <Flex justify="space-between">
              <Button variant="secondary" onClick={goToPreviousStep}>
                Back
              </Button>
              <Button onClick={handleContinue}>Skip to Merkle Root Setup</Button>
            </Flex>
          </>
        )}
    </Stack>
  )
}
