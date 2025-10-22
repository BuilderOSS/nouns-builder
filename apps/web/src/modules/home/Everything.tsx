import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { everythingHeading, marqueeItemButton, marqueeItems } from './Home.css'

export const Everything = () => {
  return (
    <Stack mt={'x13'}>
      <Text
        fontWeight={'display'}
        textAlign={'center'}
        mx={'auto'}
        className={everythingHeading}
      >
        Everything you need in one place
      </Text>
      <Flex
        align={'center'}
        justify={'center'}
        wrap={'wrap'}
        gap={'x3'}
        mt={'x6'}
        className={marqueeItems}
      >
        <Flex
          className={marqueeItemButton}
          align={'center'}
          justify={'center'}
          style={{ borderColor: '#DA72FF' }}
        >
          <Box
            as="img"
            src={'/home/⨳.svg'}
            alt={''}
            w={{ '@initial': 'x6', '@768': 'auto' }}
            mr={'x3'}
          />
          Auction
        </Flex>
        <Flex
          align={'center'}
          justify={'center'}
          className={marqueeItemButton}
          style={{ borderColor: '#F99044' }}
        >
          <Box
            as={'img'}
            alt={''}
            src={'/home/❂.svg'}
            width={{ '@initial': 'x6', '@768': 'auto' }}
            mr={'x3'}
          />
          Treasury
        </Flex>
        <Flex
          align={'center'}
          justify={'center'}
          className={marqueeItemButton}
          style={{ borderColor: '#00E37C' }}
        >
          <Box
            as={'img'}
            alt={''}
            src={'/home/☼.svg'}
            w={{ '@initial': 'x6', '@768': 'auto' }}
            mr={'x3'}
          />
          Governance
        </Flex>
        <Flex
          align={'center'}
          justify={'center'}
          className={marqueeItemButton}
          style={{ borderColor: '#AD74FF' }}
          display={{ '@initial': 'flex', '@768': 'none' }}
        >
          <Box
            as={'img'}
            alt={''}
            src={'/home/✤.svg'}
            w={{ '@initial': 'x6', '@768': 'auto' }}
            mr={'x3'}
          />
          No Code
        </Flex>
        <Flex
          style={{ maxWidth: '32rem' }}
          gap={'x3'}
          align={'center'}
          justify={'center'}
          wrap={'wrap'}
        >
          <Flex
            align={'center'}
            justify={'center'}
            className={marqueeItemButton}
            style={{ borderColor: '#AD74FF' }}
            display={{ '@initial': 'none', '@768': 'flex' }}
          >
            <Box
              as={'img'}
              alt={''}
              src={'/home/✤.svg'}
              w={{ '@initial': 'x6', '@768': 'auto' }}
              mr={'x3'}
            />
            No Code
          </Flex>
          <Flex
            align={'center'}
            justify={'center'}
            className={marqueeItemButton}
            style={{ borderColor: '#CDEE00' }}
          >
            <Box
              as={'img'}
              alt={''}
              src={'/home/⊛.svg'}
              w={{ '@initial': 'x6', '@768': 'auto' }}
              mr={'x3'}
            />
            Artwork
          </Flex>
          <Flex
            align={'center'}
            justify={'center'}
            className={marqueeItemButton}
            style={{ borderColor: '#8AD9FA' }}
          >
            <Box
              as={'img'}
              alt={''}
              src={'/home/✦.svg'}
              w={{ '@initial': 'x6', '@768': 'auto' }}
              mr={'x3'}
            />
            Onchain
          </Flex>
        </Flex>
      </Flex>
    </Stack>
  )
}
