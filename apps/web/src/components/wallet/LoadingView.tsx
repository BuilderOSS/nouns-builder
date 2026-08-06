'use client'

import { Flex, Spinner, Stack, Text } from '@buildeross/zord'

interface LoadingViewProps {
  message?: string
}

export function LoadingView({ message = 'Loading...' }: LoadingViewProps) {
  return (
    <Stack gap="x4" p="x5" align="center">
      <Flex justify="center" align="center" style={{ minHeight: '120px' }}>
        <Spinner />
      </Flex>
      <Text variant="paragraph-sm" color="text3" align="center">
        {message}
      </Text>
    </Stack>
  )
}
