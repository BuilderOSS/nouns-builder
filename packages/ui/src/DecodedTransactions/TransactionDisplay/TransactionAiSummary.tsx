import { TransactionSummaryError } from '@buildeross/hooks/useTransactionSummary'
import { Box, Button, Text } from '@buildeross/zord'
import React from 'react'

const getErrorMessage = (error: unknown) =>
  error instanceof TransactionSummaryError
    ? error.message
    : "Couldn't generate a summary."

const isHiddenError = (error: unknown) =>
  error instanceof TransactionSummaryError && error.kind === 'hidden'

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

  return (
    <Box
      px="x3"
      py="x2"
      backgroundColor="background2"
      borderBottomRadius="curved"
      border="1px solid"
      borderColor="border"
    >
      <Text
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <Text as="span" fontWeight="heading" color="accent">
          🤖 AI Summary:{' '}
        </Text>
        {isGeneratingSummary && <Text as="span"> Generating summary...</Text>}
        {!isGeneratingSummary && aiSummary && <Text as="span"> {aiSummary}</Text>}
        {showError && (
          <>
            <Text color="negative" as="span">
              {' '}
              {getErrorMessage(errorSummary)}{' '}
            </Text>
            <Button onClick={onRegenerate} variant="outline" size="sm" px="x2">
              Retry
            </Button>
          </>
        )}
      </Text>
      {!isGeneratingSummary && aiSummary && (
        <Text variant="paragraph-xs" color="text4" mt="x1">
          AI-generated from the decoded call. Always verify the details above.
        </Text>
      )}
    </Box>
  )
}
