import { useIsMounted } from '@buildeross/hooks/useIsMounted'
import { NetworkController } from '@buildeross/ui/NetworkController'
import { atoms, Box, Flex, Stack } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import NogglesLogo from '../assets/builder-framed.svg'
import TestnetLogo from '../assets/testnet.svg'
import { NavMenu } from '../DefaultLayout/NavMenu'
import { NavContainer, navLogo, NavWrapper } from './Nav.styles.css'

export const Nav = () => {
  const isMounted = useIsMounted()

  if (!isMounted) return null

  return (
    <Box className={NavContainer}>
      <Flex align={'center'} className={NavWrapper} justify={'space-between'}>
        <Flex align={'center'}>
          <Link href={'/'} passHref>
            <Stack className={navLogo}>
              <NogglesLogo
                fill={'black'}
                className={atoms({ width: 'x23', cursor: 'pointer' })}
              />
              <NetworkController.Testnet>
                <TestnetLogo
                  className={atoms({
                    width: 'x23',
                    cursor: 'pointer',
                    mt: 'x1',
                  })}
                />
              </NetworkController.Testnet>
            </Stack>
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
