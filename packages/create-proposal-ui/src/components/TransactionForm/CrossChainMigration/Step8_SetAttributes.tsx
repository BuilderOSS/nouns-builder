import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'

export const Step8_SetAttributes: React.FC = () => {
  const { goToNextStep, goToPreviousStep } = useCrossChainMigration()

  const handleSkip = () => {
    goToNextStep()
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 8: Set Token Attributes (Optional)
        </Heading>
        <Text color="text3">
          Token attributes are already available via merkle proofs. Setting them on-chain
          is optional and can be done later if needed.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          About Token Attributes
        </Heading>
        <Stack gap="x3">
          <Box>
            <Text fontWeight="label" mb="x1">
              Merkle-based Attributes (Current)
            </Text>
            <Text fontSize={14} color="text3">
              Attributes are available via merkle proofs set in Step 5. This is
              gas-efficient and already functional for displaying token metadata.
            </Text>
          </Box>
          <Box>
            <Text fontWeight="label" mb="x1">
              On-chain Attributes (Optional)
            </Text>
            <Text fontSize={14} color="text3">
              You can optionally set attributes directly on the metadata contract. This
              requires transactions for each token with attributes and can be expensive
              for large collections.
            </Text>
          </Box>
        </Stack>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="warning" color="background1">
        <Heading size="xs" mb="x2">
          Recommendation
        </Heading>
        <Text fontSize={14}>
          For most use cases, merkle-based attributes are sufficient and much more
          gas-efficient. We recommend skipping this step unless you have a specific need
          for on-chain storage.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Options
        </Heading>
        <Stack gap="x2" fontSize={14}>
          <Box>
            <Text fontWeight="label" mb="x1">
              1. Skip for now (Recommended)
            </Text>
            <Text color="text3">
              Continue to proposal creation. Attributes will work via merkle proofs.
            </Text>
          </Box>
          <Box>
            <Text fontWeight="label" mb="x1">
              2. Set attributes later
            </Text>
            <Text color="text3">
              You can batch-set attributes after the migration via a separate proposal if
              needed.
            </Text>
          </Box>
        </Stack>
      </Box>

      <Flex justify="space-between">
        <Button variant="secondary" onClick={goToPreviousStep}>
          Back to Token Minting
        </Button>
        <Button onClick={handleSkip}>Skip & Continue to Proposal</Button>
      </Flex>
    </Stack>
  )
}
