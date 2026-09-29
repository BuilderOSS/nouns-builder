import { DaysHoursMinsSecs } from '@buildeross/ui/Fields'
import { Box, Stack, Text } from '@buildeross/zord'
import type { FormikProps } from 'formik'

import type { UniswapSwapFormValues } from '../UniswapSwap.schema'

interface DeadlineSelectorProps {
  formik: FormikProps<UniswapSwapFormValues>
  executionDelayText?: string
  totalExecutionDelayHours?: number
}

export const DeadlineSelector: React.FC<DeadlineSelectorProps> = ({
  formik,
  executionDelayText,
  totalExecutionDelayHours,
}) => {
  const { values, errors, touched } = formik

  // Calculate total hours from deadline duration
  const deadlineHours =
    (values.deadline.days || 0) * 24 +
    (values.deadline.hours || 0) +
    (values.deadline.minutes || 0) / 60 +
    (values.deadline.seconds || 0) / 3600

  const getDeadlineDescription = (): string => {
    if (deadlineHours <= 0) return ''

    const parts: string[] = []
    const days = values.deadline.days || 0
    const hours = values.deadline.hours || 0
    const minutes = values.deadline.minutes || 0
    const seconds = values.deadline.seconds || 0

    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
    if (minutes > 0) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
    if (seconds > 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`)

    if (parts.length === 0) return ''
    if (parts.length === 1) return parts[0]
    return `${parts.slice(0, -1).join(', ')} & ${parts[parts.length - 1]}`
  }

  // Calculate total swap expiry from proposal submission (governance delay + expiry window)
  const totalDeadlineFromSubmission = totalExecutionDelayHours
    ? totalExecutionDelayHours + deadlineHours
    : undefined

  const getTotalDeadlineDescription = (): string => {
    if (!totalDeadlineFromSubmission) return ''
    const days = Math.floor(totalDeadlineFromSubmission / 24)
    const hours = Math.floor(totalDeadlineFromSubmission % 24)
    const parts: string[] = []
    if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`)
    if (hours > 0) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
    return parts.join(' and ')
  }

  // Use actual governance delay if available, otherwise default to 1-10 days range
  const minRecommendedHours = totalExecutionDelayHours
    ? Math.min(96, Math.max(24, totalExecutionDelayHours * 0.25)) // 1-4 days, scaled by governance delay
    : 24
  const maxRecommendedHours = minRecommendedHours * 2

  const isShortDeadline = deadlineHours > 0 && deadlineHours < minRecommendedHours
  const isLongDeadline = deadlineHours > maxRecommendedHours
  const isReasonableDeadline =
    deadlineHours >= minRecommendedHours && deadlineHours <= maxRecommendedHours

  return (
    <Stack gap="x3">
      <Box>
        <Text fontWeight="display" mb="x3">
          Swap Expiry
        </Text>
        <Text variant="paragraph-sm" color="text3" mb="x3">
          Choose how long the swap should remain valid after the proposal is expected to
          be ready to execute. This sets the deadline timestamp inside the swap
          transaction. If the swap is attempted after that time, it should fail instead of
          trading at a stale price.
        </Text>
        {executionDelayText && totalDeadlineFromSubmission && (
          <Box
            p="x3"
            backgroundColor="background2"
            borderRadius="curved"
            mb="x3"
            borderWidth="thin"
            borderStyle="solid"
            borderColor="border"
          >
            <Stack gap="x2">
              <Text fontSize="14" color="text2">
                <strong>Estimated proposal timeline</strong>
              </Text>
              <Text fontSize="14" color="text3">
                • Proposal ready to execute: <strong>{executionDelayText}</strong>
              </Text>
              <Text fontSize="14" color="text3">
                • Swap expiry window: <strong>{getDeadlineDescription()}</strong>
              </Text>
              <Text fontSize="14" color="text2" mt="x1" fontWeight="display">
                = Swap expires about <strong>{getTotalDeadlineDescription()}</strong> from
                now
              </Text>
            </Stack>
          </Box>
        )}

        <DaysHoursMinsSecs
          id="deadline"
          inputLabel="Swap expiry window"
          formik={formik}
          value={values.deadline}
          onChange={() => {}}
          errorMessage={touched.deadline ? errors.deadline : undefined}
          placeholder={[
            totalExecutionDelayHours
              ? String(Math.floor(totalExecutionDelayHours / 24))
              : '7',
            totalExecutionDelayHours
              ? String(Math.floor(totalExecutionDelayHours % 24))
              : '0',
            '0',
            '0',
          ]}
          helperText="Starts after the proposal is expected to be ready to execute"
          marginBottom="x3"
        />
      </Box>

      {isShortDeadline && (
        <Box
          p="x3"
          borderRadius="phat"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="warning"
        >
          <Text fontSize="14">
            <strong>⚠️ Short expiry warning:</strong> This may not leave enough time for
            the proposal transaction to be submitted after the proposal is ready to
            execute.
            {totalDeadlineFromSubmission && (
              <>
                {' '}
                Swap would expire about <strong>{getTotalDeadlineDescription()}</strong>.
              </>
            )}{' '}
            Consider a longer expiry window.
          </Text>
        </Box>
      )}

      {isLongDeadline && (
        <Box
          p="x3"
          borderRadius="phat"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="warning"
        >
          <Text fontSize="14">
            <strong>⚠️ Long expiry warning:</strong> A very long expiry window gives the
            swap more time to execute against stale market prices.
            {totalDeadlineFromSubmission && (
              <>
                {' '}
                Swap would expire about <strong>{getTotalDeadlineDescription()}</strong>.
              </>
            )}{' '}
            Consider a shorter expiry window with appropriate slippage tolerance.
          </Text>
        </Box>
      )}

      {isReasonableDeadline && (
        <Box
          p="x3"
          borderRadius="phat"
          borderWidth="normal"
          borderStyle="solid"
          borderColor="positive"
        >
          <Text fontSize="14">
            {totalDeadlineFromSubmission ? (
              <>
                ✅ <strong>Good expiry window.</strong> This gives the proposal
                transaction time to be submitted while limiting stale-price risk. Swap
                expires about <strong>{getTotalDeadlineDescription()}</strong> from
                submission.
              </>
            ) : (
              <>
                ✅ Swap expiry window of <strong>{getDeadlineDescription()}</strong>{' '}
                balances time for submission with protection against stale prices.
              </>
            )}
          </Text>
        </Box>
      )}
    </Stack>
  )
}
