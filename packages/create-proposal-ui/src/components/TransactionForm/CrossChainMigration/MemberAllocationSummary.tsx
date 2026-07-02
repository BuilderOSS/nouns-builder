import { Box, Flex, Heading, Stack, Text } from '@buildeross/zord'

import { ValidationResult } from '../../../utils/validateMemberAllocation'

interface MemberAllocationSummaryProps {
  validation: ValidationResult
}

export const MemberAllocationSummary: React.FC<MemberAllocationSummaryProps> = ({
  validation,
}) => {
  const { stats, errors, warnings } = validation
  const { reserved, allocated, remaining, exceeds } = stats

  return (
    <Stack gap="x4">
      {/* Summary Box */}
      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          Token Allocation Summary
        </Heading>
        <Stack gap="x2">
          <Flex justify="space-between">
            <Text color="text3">Reserved Tokens:</Text>
            <Text fontWeight="label">
              0 - {reserved - 1} ({reserved} tokens)
            </Text>
          </Flex>
          <Flex justify="space-between">
            <Text color="text3">Currently Allocated:</Text>
            <Text fontWeight="label">{allocated} tokens</Text>
          </Flex>
          {remaining > 0 && (
            <Flex justify="space-between">
              <Text color="text3">Remaining Unallocated:</Text>
              <Text fontWeight="label">{remaining} tokens</Text>
            </Flex>
          )}
          {exceeds > 0 && (
            <Flex justify="space-between">
              <Text color="negative">Exceeds Reserved By:</Text>
              <Text fontWeight="label" color="negative">
                {exceeds} tokens
              </Text>
            </Flex>
          )}
        </Stack>
      </Box>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="negative">
          <Heading size="xs" mb="x2" color="onNegative">
            ❌ Errors Found
          </Heading>
          <Stack gap="x2">
            {errors.map((error, idx) => (
              <Text key={idx} color="onNegative" fontSize={14}>
                • {error}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      {/* Warning Messages */}
      {warnings.length > 0 && errors.length === 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="warning">
          <Heading size="xs" mb="x2" color="onWarning">
            ⚠️ Warnings
          </Heading>
          <Stack gap="x2">
            {warnings.map((warning, idx) => (
              <Text key={idx} color="onWarning" fontSize={14}>
                • {warning}
              </Text>
            ))}
          </Stack>
        </Box>
      )}

      {/* Success Message */}
      {errors.length === 0 && warnings.length === 0 && (
        <Box p="x4" borderRadius="curved" backgroundColor="positive">
          <Text color="onPositive">
            ✅ All {reserved} reserved tokens are properly allocated with no errors.
          </Text>
        </Box>
      )}
    </Stack>
  )
}
