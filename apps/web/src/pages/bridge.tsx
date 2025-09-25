import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'
import Head from 'next/head'
import Image from 'next/image'
import React from 'react'
import { getDefaultLayout } from 'src/layouts/DefaultLayout'
import { useAccount, useBalance } from 'wagmi'

import { NextPageWithLayout } from './_app'

const networks = [
  {
    chainId: CHAIN_ID.ZORA,
    bridgeURL: 'https://bridge.zora.energy/',
    bridgeLogo: '/chains/zora_wordmark.svg',
  },
  {
    chainId: CHAIN_ID.BASE,
    bridgeURL: 'https://bridge.base.org/',
    bridgeLogo: '/chains/base_wordmark.svg',
  },
  {
    chainId: CHAIN_ID.OPTIMISM,
    bridgeURL: 'https://app.optimism.io/bridge',
    bridgeLogo: '/chains/optimism_wordmark.svg',
  },
]

const BridgePage: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Nouns Builder | Bridge</title>
      </Head>

      <Flex align={'center'} justify={'space-around'}>
        <Box
          my={{ '@initial': 'x6', '@768': 'x20' }}
          mx="x4"
          w="100%"
          style={{
            maxWidth: '1000px',
          }}
        >
          <Heading size="md" mb="x2">
            Bridge
          </Heading>
          <Text color="text2">Select the network you want to bridge assets to</Text>

          <Flex
            mt="x10"
            align={'center'}
            justify={'space-around'}
            style={{ flexWrap: 'wrap' }}
          >
            {networks.map((network) => (
              <NetworkCard {...network} />
            ))}
          </Flex>
        </Box>
      </Flex>
    </>
  )
}

const NetworkCard: React.FC<{
  chainId: CHAIN_ID
  bridgeURL: string
  bridgeLogo: string
}> = ({ chainId, bridgeLogo, bridgeURL }) => {
  const { address } = useAccount()
  const { data: userBalance } = useBalance({
    address,
    chainId,
  })

  const chain = PUBLIC_ALL_CHAINS.find((x) => x.id === chainId)

  if (!chain) return null

  return (
    <Box mt={{ '@initial': 'x8', '@768': 'x0' }}>
      <Flex
        justify={'center'}
        borderColor="border"
        borderStyle="solid"
        style={{
          width: 300,
          height: 250,
          borderTopLeftRadius: '0.8rem',
          borderTopRightRadius: '0.8rem',
        }}
      >
        <Image alt="bridge-logo" style={{ width: 200 }} src={bridgeLogo} />
      </Flex>
      <Stack
        p="x5"
        style={{
          borderBottomLeftRadius: '0.8rem',
          borderBottomRightRadius: '0.8rem',
          borderBottom: '2px solid rgb(242, 242, 242)',
          borderLeft: '2px solid rgb(242, 242, 242)',
          borderRight: '2px solid rgb(242, 242, 242)',
        }}
      >
        <Flex align={'center'} justify={'space-between'} w="100%">
          <Box>
            <Box as={'span'} fontWeight={'display'}>
              Balance:
            </Box>{' '}
            {userBalance?.formatted?.slice(0, 5)} ETH
          </Box>
          <Image style={{ height: 20, width: 20 }} src={chain.icon} alt={chain.name} />
        </Flex>
        <Box
          as="a"
          href={bridgeURL}
          style={{ width: '100%' }}
          target="_blank"
          rel="noreferrer"
          mt="x5"
        >
          <Button w="100%">
            <Flex align={'center'}>
              <Box>Bridge</Box>
              <Icon ml="x1" m="x0" size="sm" fill="neutral" id="external-16" />
            </Flex>
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

BridgePage.getLayout = getDefaultLayout

export default BridgePage
