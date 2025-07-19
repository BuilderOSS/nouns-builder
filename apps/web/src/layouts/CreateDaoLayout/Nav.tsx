import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { Box, Flex, Label, atoms } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import { NetworkController } from 'src/components/NetworkController'

import { NavMenu } from '../DefaultLayout/NavMenu'
import NogglesLogo from '../assets/builder-framed.svg'
import TestnetLogo from '../assets/testnet.svg'
import { NavContainer, NavWrapper } from './Nav.styles.css'

export const Nav = () => {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <Box className={NavContainer}>
      <Flex align={'center'} className={NavWrapper} justify={'space-between'}>
        <Flex align={'center'}>
          <Link href={'/'} passHref>
            <Flex direction={'row'} align="center">
              <NetworkController.Mainnet>
                <NogglesLogo
                  fill={'white'}
                  className={atoms({ width: 'x23', cursor: 'pointer' })}
                />
              </NetworkController.Mainnet>

              <NetworkController.Testnet>
                <NogglesLogo
                  fill={'white'}
                  className={atoms({ width: 'x23', cursor: 'pointer' })}
                />
              </NetworkController.Testnet>

              <Box ml={'x3'} display={{ '@initial': 'none', '@768': 'block' }}>
                <Label color={'onAccent'}>Builder</Label>

                <NetworkController.Testnet>
                  <TestnetLogo />
                </NetworkController.Testnet>
              </Box>
            </Flex>
          </Link>
        </Flex>

        <Flex align="center">
          <Flex direction={'row'} align={'center'} gap={'x4'}>
            <NavMenu />
          </Flex>
        </Flex>
      </Flex>
    </Box>
  )
}
