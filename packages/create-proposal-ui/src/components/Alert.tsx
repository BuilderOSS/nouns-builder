import { Stack, Text } from '@buildeross/zord'

export const Alert = () => {
  return (
    <Stack>
      <Text textTransform={'uppercase'} variant={'label-md'} color={'text3'} mb={'x1'}>
        Action required
      </Text>
      <Text variant={'label-lg'} mb={'x5'}>
        Upgrade Contracts to Unlock New Features
      </Text>
    </Stack>
  )
}
