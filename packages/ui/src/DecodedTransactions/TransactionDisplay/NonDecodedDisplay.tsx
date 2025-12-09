import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { atoms, Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'
import { formatEther } from 'viem'

export const NonDecodedDisplay: React.FC<{
  target: string
  chainId: CHAIN_ID
  calldata: string
  value: string
}> = ({ target, chainId, calldata, value }) => {
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
      <Flex pl={'x2'}>
        {value !== '0' ? 'calldata: ' : ''}
        {calldata}
      </Flex>
      {value !== '0' && (
        <Flex pl={'x2'} align="center" gap="x1">
          <Text color="accent">value:</Text>
          <img
            src="/chains/ethereum.svg"
            alt="ETH"
            loading="lazy"
            decoding="async"
            width="16px"
            height="16px"
            style={{ maxWidth: '16px', maxHeight: '16px', objectFit: 'contain' }}
          />
          <Text color="accent">{formatCryptoVal(formatEther(BigInt(value)))} ETH</Text>
        </Flex>
      )}
    </Stack>
  )
}
