import { Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

export const CreateDaoButton = () => {
  return (
    <Link href="/create" passHref>
      <Flex
        as={'button'}
        id={'close-modal'}
        justify={'center'}
        w={'100%'}
        py={'x2'}
        backgroundColor={'ghost'}
        color={'text1'}
        cursor={'pointer'}
        style={{
          borderRadius: 8,
          border: '2px solid #F2F2F2',
        }}
      >
        <Text variant={'label-md'}>Create a DAO</Text>
      </Flex>
    </Link>
  )
}
