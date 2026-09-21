'use client'

import { Flex, Spinner, Stack, Text } from '@buildeross/zord'

interface LoadingViewProps {
  message?: string
}

export function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <Stack gap="x4" align="center" style={{ gap: 'clamp(16px, 4vw, 24px)' }}>
      <Flex
        justify="center"
        align="center"
        style={{ minHeight: 'clamp(88px, 20vw, 120px)' }}
      >
        <Spinner />
      </Flex>
      <Text variant="paragraph-sm" color="text3" align="center">
        {message}
      </Text>
    </Stack>
  )
}
