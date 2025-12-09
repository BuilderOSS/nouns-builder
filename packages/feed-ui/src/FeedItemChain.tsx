import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import type { CHAIN_ID } from '@buildeross/types'
import { Flex, Text } from '@buildeross/zord'
import React from 'react'

import { feedItemChainName } from './Feed.css'

interface FeedItemChainProps {
  chainId: CHAIN_ID
}

export const FeedItemChain: React.FC<FeedItemChainProps> = ({ chainId }) => {
  const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === chainId)!

  return (
    <Flex align="center" gap="x1">
      <Flex
        align="center"
        justify="center"
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <img
          width={20}
          height={20}
          loading="lazy"
          decoding="async"
          style={{ height: 20, width: 20, borderRadius: '50%', overflow: 'hidden' }}
          src={chain.icon}
          alt={chain.name}
        />
      </Flex>
      <Text className={feedItemChainName} variant="paragraph-sm">
        {chain.name}
      </Text>
    </Flex>
  )
}
