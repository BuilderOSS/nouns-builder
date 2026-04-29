import { Box, Button, Text } from '@buildeross/zord'
import React from 'react'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  try {
    return JSON.stringify(error)
  } catch (_error) {
    return typeof error === 'undefined' ? '<unserializable error>' : String(error)
  }
}

export const TransactionAiSummary: React.FC<{
  isVisible: boolean
  isGeneratingSummary: boolean
  aiSummary: string | null | undefined
  errorSummary: unknown
  onRegenerate: () => void
}> = ({ isVisible, isGeneratingSummary, aiSummary, errorSummary, onRegenerate }) => {
  if (!isVisible) return null

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
        {!isGeneratingSummary && !aiSummary && errorSummary && (
          <Button onClick={onRegenerate} variant="outline" size="sm" px="x2">
            Regenerate
          </Button>
        )}
        {isGeneratingSummary && <Text as="span">Generating summary...</Text>}
        {!isGeneratingSummary && aiSummary && <Text as="span">{aiSummary}</Text>}
        {!isGeneratingSummary && !aiSummary && errorSummary && (
          <Text color="negative" as="span">
            Error generating summary: {getErrorMessage(errorSummary)}
          </Text>
        )}
      </Text>
    </Box>
  )
}
