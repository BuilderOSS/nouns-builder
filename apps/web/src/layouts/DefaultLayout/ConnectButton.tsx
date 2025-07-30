import { Flex, Text } from '@buildeross/zord'
import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { useAccount, useSwitchChain } from 'wagmi'

import { connectButtonWrapper } from './Nav.styles.css'

export const ConnectButton = () => {
  const { address, chain: wagmiChain } = useAccount()
  const { switchChain } = useSwitchChain()
  const chain = useChainStore((x) => x.chain)

  if (address && wagmiChain?.id !== chain?.id) {
    return (
      <Flex
        as={'button'}
        w={'100%'}
        alignSelf={'center'}
        align={'center'}
        justify={'center'}
        onClick={() => switchChain?.({ chainId: chain.id })}
        py={'x2'}
        style={{
          backgroundColor: '#F5E2E2',
          color: '#F03232',
          borderRadius: 8,
          border: 0,
        }}
        cursor={'pointer'}
      >
        <Text variant={'paragraph-md'}>Wrong Network</Text>
      </Flex>
    )
  }

  if (address || wagmiChain) {
    return null
  }

  return (
    <Flex
      direction="row"
      align="center"
      className={connectButtonWrapper}
      id="connect-button-wrapper"
      w={'100%'}
      justify="center"
      cursor={'pointer'}
    >
      <RKConnectButton
        showBalance={false}
        label={'Connect'}
        chainStatus={'none'}
        accountStatus={'address'}
      />
    </Flex>
  )
}
