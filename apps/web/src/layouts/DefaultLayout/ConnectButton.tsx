import { useAuthStore } from '@buildeross/stores'
import { Flex } from '@buildeross/zord'
import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit'
import React from 'react'

import { connectButtonWrapper } from './Nav.styles.css'

export const ConnectButton = () => {
  const { address } = useAuthStore()

  if (address) {
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
