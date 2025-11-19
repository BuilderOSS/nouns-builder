import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import type { CHAIN_ID } from '@buildeross/types'
import { Flex, Text } from '@buildeross/zord'
import Image from 'next/image'
import React from 'react'

import { feedItemActorName } from './Feed.css'

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
        <Image
          priority={true}
          quality={100}
          style={{ height: 22, width: 22, borderRadius: '50%', overflow: 'hidden' }}
          src={chain.icon}
          alt={chain.name}
        />
      </Flex>
      <Text className={feedItemActorName} variant="paragraph-sm">
        {chain.name}
      </Text>
    </Flex>
  )
}
