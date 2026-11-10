import { TransactionSummaryError } from '@buildeross/hooks/useTransactionSummary'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  skeletonLine,
  sparkle,
  summaryText,
  visuallyHidden,
} from './TransactionAiSummary.css'

const getErrorMessage = (error: unknown) =>
  error instanceof TransactionSummaryError
    ? error.message
    : "Couldn't generate a summary."

const isHiddenError = (error: unknown) =>
  error instanceof TransactionSummaryError && error.kind === 'hidden'

const SparkleIcon: React.FC = () => (
  <svg
    className={sparkle}
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 1.75c.4 2.9 1.35 3.85 4.25 4.25-2.9.4-3.85 1.35-4.25 4.25C7.6 7.35 6.65 6.4 3.75 6 6.65 5.6 7.6 4.65 8 1.75Z" />
    <path d="M12.5 10.5c.2 1.3.7 1.8 2 2-1.3.2-1.8.7-2 2-.2-1.3-.7-1.8-2-2 1.3-.2 1.8-.7 2-2Z" />
  </svg>
)

export const TransactionAiSummary: React.FC<{
  isVisible: boolean
  isGeneratingSummary: boolean
  aiSummary: string | null | undefined
  errorSummary: unknown
  onRegenerate: () => void
}> = ({ isVisible, isGeneratingSummary, aiSummary, errorSummary, onRegenerate }) => {
  if (!isVisible) return null

  const showError = !isGeneratingSummary && !aiSummary && !!errorSummary

  // Signed out or no AI provider configured: show nothing rather than an error.
  if (showError && isHiddenError(errorSummary)) return null
  if (!isGeneratingSummary && !aiSummary && !showError) return null

  return (
    <Stack
      as="section"
      aria-label="AI summary"
      aria-busy={isGeneratingSummary}
      gap="x1"
      px="x2"
      pt="x2"
    >
      <Flex align="center" gap="x1" wrap="wrap">
        <SparkleIcon />
        <Text as="span" variant="label-xs" color="text2">
          AI summary
        </Text>
        {aiSummary && !isGeneratingSummary && (
          <Text as="span" variant="paragraph-xs" color="text2">
            · verify against the call above
          </Text>
        )}
      </Flex>

      <Box aria-live="polite">
        {isGeneratingSummary ? (
          <>
            <Stack gap="x2" py="x1" aria-hidden="true">
              <Box className={skeletonLine} style={{ width: '92%' }} />
              <Box className={skeletonLine} style={{ width: '56%' }} />
            </Stack>
            <span className={visuallyHidden}>Generating summary…</span>
          </>
        ) : aiSummary ? (
          <Text variant="paragraph-md" color="text1" className={summaryText}>
            {aiSummary}
          </Text>
        ) : (
          <Flex align="center" gap="x2" wrap="wrap">
            <Text as="span" variant="paragraph-sm" color="text2">
              {getErrorMessage(errorSummary)}
            </Text>
            <Button
              type="button"
              onClick={onRegenerate}
              variant="ghost"
              size="xs"
              px="x2"
              gap="x1"
            >
              <Icon id="refresh" size="sm" aria-hidden="true" />
              Try again
            </Button>
          </Flex>
        )}
      </Box>
    </Stack>
  )
}
