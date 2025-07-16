import { Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'
import { useAccount } from 'wagmi'

export const ViewProfileButton = () => {
  const { address } = useAccount()

  if (!address) return null
  return (
    <Link href={`/profile/${address}`} passHref>
      <Flex
        as={'button'}
        id={'close-modal'}
        justify={'center'}
        w={'100%'}
        py={'x2'}
        backgroundColor={'primary'}
        color={'onAccent'}
        cursor={'pointer'}
        style={{
          borderRadius: 8,
          border: 0,
        }}
      >
        <Text variant={'label-md'}>Profile</Text>
      </Flex>
    </Link>
  )
}
