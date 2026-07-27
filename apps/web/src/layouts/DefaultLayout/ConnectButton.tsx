import { Button, Flex } from '@buildeross/zord'
import { ConnectButton as RKConnectButton } from '@rainbow-me/rainbowkit'
import React, { useState } from 'react'
import { CustomWalletModal } from 'src/components/CustomWalletModal'
import { useAccount } from 'wagmi'

import { connectButtonWrapper } from './Nav.styles.css'

export const ConnectButton = () => {
  const [showModal, setShowModal] = useState(false)
  const { connector } = useAccount()
  const isSafeMode = connector?.id === 'safeOwner'

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
      <RKConnectButton.Custom>
        {({
          account,
          chain,
          openAccountModal,
          openChainModal,
          mounted,
          authenticationStatus,
        }) => {
          // SSR safety
          if (!mounted) {
            return (
              <Button
                variant="primary"
                size="sm"
                style={{
                  opacity: 0,
                  pointerEvents: 'none',
                  fontSize: '16px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                }}
                aria-hidden
              >
                Connect
              </Button>
            )
          }

          // Not connected OR not authenticated - show custom connect button
          if (!account || authenticationStatus === 'unauthenticated') {
            return (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowModal(true)}
                  style={{ fontSize: '16px', paddingLeft: '24px', paddingRight: '24px' }}
                >
                  Connect
                </Button>
                <CustomWalletModal
                  isOpen={showModal}
                  onClose={() => setShowModal(false)}
                />
              </>
            )
          }

          // Still loading authentication
          if (authenticationStatus === 'loading') {
            return (
              <Button
                variant="primary"
                size="sm"
                disabled
                style={{ fontSize: '16px', paddingLeft: '24px', paddingRight: '24px' }}
              >
                Authenticating...
              </Button>
            )
          }

          // Connected but wrong chain
          if (chain?.unsupported) {
            return (
              <Button
                variant="negative"
                size="sm"
                onClick={openChainModal}
                style={{ fontSize: '16px', paddingLeft: '24px', paddingRight: '24px' }}
              >
                Wrong network
              </Button>
            )
          }

          // Connected - wagmi automatically shows Safe address when using SafeOwnerConnector
          return (
            <Flex gap="x2" align="center">
              <Button
                variant="ghost"
                size="sm"
                onClick={isSafeMode ? undefined : openChainModal}
                disabled={isSafeMode}
                style={{
                  fontSize: '16px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  opacity: isSafeMode ? 0.6 : 1,
                  cursor: isSafeMode ? 'not-allowed' : 'pointer',
                }}
                title={isSafeMode ? 'Cannot switch chain for Safe' : undefined}
              >
                {chain?.hasIcon && chain.iconUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={chain.name ?? 'Chain icon'}
                    src={chain.iconUrl}
                    style={{ width: 16, height: 16, marginRight: 8 }}
                  />
                )}
                {chain?.name}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={openAccountModal}
                style={{ fontSize: '16px', paddingLeft: '24px', paddingRight: '24px' }}
              >
                {account.displayName}
              </Button>
            </Flex>
          )
        }}
      </RKConnectButton.Custom>
    </Flex>
  )
}
