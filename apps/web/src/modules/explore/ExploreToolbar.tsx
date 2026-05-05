import { Box, Flex, Text, vars } from '@buildeross/zord'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { useAccount } from 'wagmi'

import { ExploreSortMenu } from './ExploreSortMenu'

interface ExploreToolbarProps {
  title: string
  showSort?: boolean
  helperText?: string
}

export const ExploreToolbar: React.FC<ExploreToolbarProps> = ({
  title,
  showSort = false,
  helperText,
}) => {
  const { query, pathname } = useRouter()
  const { address } = useAccount()

  return (
    <Flex
      direction={'column'}
      w={'100%'}
      mb={address ? 'x0' : 'x5'}
      align={'center'}
      style={{ maxWidth: 912 }}
    >
      <Flex direction={'row'} w={'100%'} justify={'space-between'}>
        <Box fontSize={28} fontWeight={'heading'} mb={'x8'}>
          {title}
        </Box>
        {showSort && <ExploreSortMenu choice={(query?.sortKey as string) || 'CREATED'} />}
      </Flex>
      {address && (
        <>
          <Flex w={'100%'} justify={'center'}>
            <Link href={'/explore'} passHref>
              <Box
                h={'100%'}
                mb={'x4'}
                mx={'x4'}
                aria-current={pathname === '/explore' ? 'page' : undefined}
                style={{
                  borderBottom:
                    pathname === '/explore' ? `2px solid ${vars.color.text1}` : `0px`,
                }}
              >
                <Text variant="paragraph-md">Explore</Text>
              </Box>
            </Link>
            <Link href={'/mydaos'} passHref>
              <Box
                h={'100%'}
                mb={'x4'}
                mx={'x4'}
                aria-current={pathname === '/mydaos' ? 'page' : undefined}
                style={{
                  borderBottom:
                    pathname === '/mydaos' ? `2px solid ${vars.color.text1}` : `0px`,
                }}
              >
                <Text variant="paragraph-md">My DAOs</Text>
              </Box>
            </Link>
            <Link href={'/favorites'} passHref>
              <Box
                h={'100%'}
                mb={'x4'}
                mx={'x4'}
                aria-current={pathname === '/favorites' ? 'page' : undefined}
                style={{
                  borderBottom:
                    pathname === '/favorites' ? `2px solid ${vars.color.text1}` : `0px`,
                }}
              >
                <Text variant="paragraph-md">Favorites</Text>
              </Box>
            </Link>
          </Flex>

          <Box
            w={'100%'}
            mb={'x5'}
            style={{ borderBottom: `2px solid ${vars.color.border}` }}
          />
        </>
      )}
      {helperText ? (
        <Text variant="paragraph-sm" color="tertiary" align="left" width="100%" mb="x5">
          {helperText}
        </Text>
      ) : null}
    </Flex>
  )
}
