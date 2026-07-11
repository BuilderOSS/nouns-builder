import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { metadataAbi } from '@buildeross/sdk/contract'
import { Accordion } from '@buildeross/ui'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { useEffect, useMemo } from 'react'
import { decodeFunctionData } from 'viem'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { MAX_ITEMS_PER_CHUNK, useSetupMetadata } from '../../../hooks/useSetupMetadata'

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
    metadataProgress: persistedProgress,
    metadataTxHashes: persistedTxHashes,
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
    addMetadataTxHash,
    persistedProgress,
    persistedTxHashes
  )

  // Dual state pattern: Hook fetches properties via SWR, store persists for refresh
  // Priority: Hook state (if loaded) > Store state (after refresh)
  // Save fetched properties to Zustand for persistence
  useEffect(() => {
    if (properties && properties.length > 0 && !cachedProperties) {
      setMetadataProperties(properties)
    }
  }, [properties, cachedProperties, setMetadataProperties])

  // Reset progress if it doesn't match actual properties length
  useEffect(() => {
    if (
      properties &&
      persistedProgress &&
      persistedProgress.total !== properties.length &&
      persistedProgress.total > 0
    ) {
      updateMetadataProgress(0, properties.length)
    }
  }, [properties, persistedProgress, updateMetadataProgress])

  // Use cached properties if SWR hasn't loaded yet (e.g., after page refresh)
  const activeProperties = useMemo(
    () => properties || cachedProperties || [],
    [properties, cachedProperties]
  )

  const currentProperty = progress.current
  const totalProperties = progress.total

  // Check completion based on txHashes matching property count, not just progress counters
  // This ensures completion detection works correctly even after page refresh
  const isComplete =
    activeProperties.length > 0 &&
    txHashes.length === activeProperties.length &&
    txHashes.length > 0 &&
    !isAddingProperties

  // Decode properties to show detailed breakdown
  const propertyBreakdown = useMemo(() => {
    if (activeProperties.length === 0) return []

    return activeProperties.map((encodedProperty, index) => {
      try {
        const decoded = decodeFunctionData({
          abi: metadataAbi,
          data: encodedProperty as `0x${string}`,
        })

        const [names, items] = decoded.args as unknown as [
          string[],
          { propertyId: bigint; name: string; isNewProperty: boolean }[],
        ]

        // Count items per property
        const propertyCounts = new Map<string, number>()
        items.forEach((item) => {
          const propertyName = names[Number(item.propertyId)]
          propertyCounts.set(propertyName, (propertyCounts.get(propertyName) || 0) + 1)
        })

        // Create property details array
        const propertyDetails = Array.from(propertyCounts.entries()).map(
          ([name, count]) => ({
            name,
            count,
          })
        )

        return {
          transactionNumber: index + 1,
          totalItems: items.length,
          properties: propertyDetails,
        }
      } catch (err) {
        console.error('Error decoding property:', err)
        return {
          transactionNumber: index + 1,
          totalItems: 0,
          properties: [],
        }
      }
    })
  }, [activeProperties])

  // Transform propertyBreakdown into Accordion items format
  const accordionItems = useMemo(() => {
    return propertyBreakdown.map((batch) => ({
      title: `Transaction ${batch.transactionNumber}: ${batch.totalItems} items`,
      description: (
        <Stack gap="x2">
          {batch.properties.map((prop, idx) => (
            <Flex key={idx} justify="space-between">
              <Text color="text3" fontSize={14}>
                • {prop.name}
              </Text>
              <Text color="text3" fontSize={14}>
                {prop.count} {prop.count === 1 ? 'item' : 'items'}
              </Text>
            </Flex>
          ))}
        </Stack>
      ),
      defaultOpen: false,
      titleFontSize: 20,
    }))
  }, [propertyBreakdown])

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
            Property Batches to Add
          </Heading>
          <Stack gap="x2">
            <Flex align="center" flexDirection="row" gap="x2">
              <Text color="text3">Total Transactions:</Text>
              <Text fontWeight="label">{activeProperties.length}</Text>
            </Flex>
            <Text color="text4" fontSize={12} mt="x2">
              Properties are batched into transactions to optimize gas usage, with a
              target of around {MAX_ITEMS_PER_CHUNK} items per transaction. Each property
              is kept complete and never split across transactions.
            </Text>
          </Stack>
        </Box>
      )}

      {!isComplete && accordionItems.length > 0 && <Accordion items={accordionItems} />}

      {!isComplete && activeProperties.length > 0 && (
        <Stack gap="x3" align="flex-end">
          <Button
            onClick={handleAddProperties}
            disabled={isAddingProperties}
            loading={isAddingProperties}
          >
            {isAddingProperties
              ? `Adding Properties (${currentProperty}/${totalProperties})...`
              : 'Add All Properties'}
          </Button>
          <Text color="text4" fontSize={12}>
            {isAddingProperties
              ? `This may take several minutes for large collections. Each transaction is confirmed before the next begins.`
              : `${activeProperties.length} transaction${activeProperties.length > 1 ? 's' : ''} will be sent.`}
          </Text>
        </Stack>
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
