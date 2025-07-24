import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Flex, FlexProps, Text } from '@buildeross/zord'
import React from 'react'
import CopyButton from 'src/components/CopyButton/CopyButton'
import { Icon } from 'src/components/Icon'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'

export type ContractLinkProps = {
  address?: string
  size?: 'sm' | 'md'
}
export const ContractLink = ({ address, size = 'md' }: ContractLinkProps) => {
  const { isMobile } = useLayoutStore()
  const { chain } = useChainStore()

  const { py, px } = React.useMemo(() => {
    let px: FlexProps['px'] = { '@initial': 'x4', '@768': 'x6' }
    let py: FlexProps['py'] = { '@initial': 'x4', '@768': 'x5' }
    if (size === 'sm') {
      px = { '@initial': 'x2', '@768': 'x3' } as FlexProps['px']
      py = { '@initial': 'x2', '@768': 'x3' } as FlexProps['py']
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
      gap="x2"
    >
      <Text fontSize={16}>
        {isMobile || size === 'sm' ? walletSnippet(address as string, 8) : address}
      </Text>
      <Flex justify={'center'} align={'center'} gap={{ '@initial': 'x2', '@768': 'x4' }}>
        <a
          href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${address}`}
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
