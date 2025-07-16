import { Flex, Text } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

const ExploreNoDaos = () => {
  return (
    <Flex
      direction={'column'}
      align={'center'}
      style={{ maxWidth: 912, minHeight: 500, padding: '150px 0px' }}
      gap={'x4'}
    >
      <Text variant={'paragraph-md'} color={'tertiary'}>
        There are no DAOs here
      </Text>
      <Link href={'/create'} passHref>
        <Flex
          as="button"
          backgroundColor={'border'}
          borderRadius={'normal'}
          borderColor={'border'}
          borderStyle={'solid'}
          borderWidth={'normal'}
          fontWeight={'display'}
          cursor={'pointer'}
          px={'x4'}
          py={'x2'}
          mx={'x1'}
        >
          Create a DAO
        </Flex>
      </Link>
    </Flex>
  )
}

export default ExploreNoDaos
