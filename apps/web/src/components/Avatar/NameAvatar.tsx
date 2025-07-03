import { Box, Text } from '@zoralabs/zord'
import { useMemo } from 'react'

import { AvatarProps } from './Avatar'
import { avatar } from './Avatar.css'

export type NameAvatarProps = Omit<AvatarProps, 'address' | 'src'> & {
  name: string
}

export function NameAvatar({
  name,
  className,
  size,
  variant,
  ...props
}: NameAvatarProps) {
  const display = useMemo(() => name.slice(0, 1).toUpperCase(), [name])

  return (
    <Box
      className={['zora-avatar', avatar({ size, variant }), className]}
      backgroundColor="background2"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      {...props}
    >
      <Text
        style={{
          fontSize: '0.8em',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
        color="text2"
      >
        {display}
      </Text>
    </Box>
  )
}
