import { Flex } from '@buildeross/zord'
import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'
import { useAccount } from 'wagmi'

import { connectButtonWrapper } from './Nav.styles.css'

export const ConnectButton = () => {
  const { address, chain: wagmiChain } = useAccount()

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
