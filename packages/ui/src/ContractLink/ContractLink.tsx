import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID } from '@buildeross/types'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Flex, FlexProps, Icon, Text } from '@buildeross/zord'
import React from 'react'

import { CopyButton } from '../CopyButton'

export type ContractLinkProps = {
  address: string
  size?: 'xs' | 'sm' | 'md'
  chainId: CHAIN_ID
}

export const ContractLink = ({ address, size = 'md', chainId }: ContractLinkProps) => {
  const { py, px } = React.useMemo(() => {
    let px: FlexProps['px'] = { '@initial': 'x4', '@768': 'x6' }
    let py: FlexProps['py'] = { '@initial': 'x4', '@768': 'x5' }
    if (size === 'sm') {
      px = { '@initial': 'x2', '@768': 'x3' } as FlexProps['px']
      py = { '@initial': 'x2', '@768': 'x3' } as FlexProps['py']
    }
    if (size === 'xs') {
      px = { '@initial': 'x2', '@768': 'x3' } as FlexProps['px']
      py = { '@initial': 'x1', '@768': 'x2' } as FlexProps['py']
    }

    return { py, px }
  }, [size])

  return (
    <Flex
      py={py}
      px={px}
      justify={'space-between'}
      align={'center'}
      borderRadius={'curved'}
      borderColor={'border'}
      borderStyle={'solid'}
      borderWidth={'normal'}
      style={{ backgroundColor: '#fafafa' }}
      gap={size === 'xs' ? 'x1' : 'x2'}
    >
      {/* Mobile Layout - Always show snippet */}
      <Text fontSize={16} display={{ '@initial': 'block', '@768': 'none' }}>
        {walletSnippet(address, 8)}
      </Text>
      {/* Desktop Layout - Show snippet only for 'sm' size */}
      <Text fontSize={16} display={{ '@initial': 'none', '@768': 'block' }}>
        {size !== 'md' ? walletSnippet(address, 8) : address}
      </Text>
      <Flex justify={'center'} align={'center'} gap={size === 'xs' ? 'x1' : 'x2'}>
        <a
          href={`${ETHERSCAN_BASE_URL[chainId]}/address/${address}`}
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="arrowTopRight" fill="text4" />
        </a>
        <CopyButton text={address} variant={'icon'} />
      </Flex>
    </Flex>
  )
}
