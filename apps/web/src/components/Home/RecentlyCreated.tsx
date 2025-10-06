import { Button, Flex, mixins, Stack, Text } from '@buildeross/zord'
import Link from 'next/link'
import React, { ReactNode } from 'react'
import { useChainStore } from 'src/stores'
import { homeSectionHeader, homeSectionWrapper } from 'src/styles/home.css'

const RecentlyCreated: React.FC<{
  children: ReactNode
  isDashboard?: boolean
}> = ({ children, isDashboard }) => {
  const chain = useChainStore((x) => x.chain)
  return (
    <Stack
      w={'100%'}
      mx={'auto'}
      mb={isDashboard ? 'x16' : 'auto'}
      justify={'flex-start'}
      mt={
        isDashboard
          ? { '@initial': 'x12', '@768': 'x24' }
          : { '@initial': 'x16', '@768': 'x32' }
      }
      className={homeSectionWrapper}
    >
      {isDashboard ? (
        <Text fontSize={28} fontWeight={'display'} mb={'x6'}>
          Explore
        </Text>
      ) : (
        <Text fontWeight={'label'} className={homeSectionHeader}>
          Recent DAOs on <span style={{ textDecoration: 'underline' }}>{chain.name}</span>
        </Text>
      )}
      {children}
      <Flex align={'center'} justify={'center'} mt={'x6'}>
        <Link href={'/explore'} passHref legacyBehavior>
          <Button
            as="a"
            borderRadius={'curved'}
            fontWeight={'display'}
            className={`${mixins({ hoverFadeOut: true })}`}
          >
            Explore All
          </Button>
        </Link>
      </Flex>
    </Stack>
  )
}

export default RecentlyCreated
