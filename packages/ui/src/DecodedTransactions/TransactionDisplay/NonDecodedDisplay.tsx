import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

export const NonDecodedDisplay: React.FC<{
  target: string
  chainId: CHAIN_ID
  calldata: string
}> = ({ target, chainId, calldata }) => {
  return (
    <Stack gap={'x1'}>
      <Box
        color={'secondary'}
        fontWeight={'heading'}
        className={atoms({ textDecoration: 'underline' })}
      >
        <a
          href={`${ETHERSCAN_BASE_URL[chainId]}/address/${target}`}
          target="_blank"
          rel="noreferrer"
        >
          <Text display={{ '@initial': 'flex', '@768': 'none' }}>
            {walletSnippet(target)}
          </Text>
          <Text display={{ '@initial': 'none', '@768': 'flex' }}>{target}</Text>
        </a>
      </Box>
      <Flex pl={'x2'}>{calldata}</Flex>
    </Stack>
  )
}
