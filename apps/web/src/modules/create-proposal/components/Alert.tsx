import { Stack, Text } from '@buildeross/zord'
import React from 'react'

export const Alert = () => {
  return (
    <Stack>
      <Text textTransform={'uppercase'} variant={'label-md'} color={'text3'} mb={'x1'}>
        Action required
      </Text>
      <Text variant={'label-lg'} mb={'x5'}>
        Upgrade Contracts to Unlock Airdrop Feature
      </Text>
    </Stack>
  )
}
