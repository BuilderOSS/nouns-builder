import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { NetworkController } from '@buildeross/ui/NetworkController'
import { atoms, Flex, Label, Stack } from '@buildeross/zord'
import Link from 'next/link'
import React from 'react'

import NogglesLogo from '../assets/builder-framed.svg'
import TestnetLogo from '../assets/testnet.svg'
import { NavContainer, navLogo, navMenuItem, NavWrapper } from './Nav.styles.css'
import { NavMenu } from './NavMenu'

export const Nav = () => {
  const scrollDirection = useScrollDirection()

  return (
    <Flex
      align="center"
      justify="space-around"
      style={{
        top: scrollDirection === 'down' ? -80 : 0,
        transitionProperty: 'all',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '150ms',
      }}
      className={NavContainer}
    >
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
          <Flex display={{ '@initial': 'none', '@768': 'flex' }} ml="x10" gap={'x4'}>
            <Link href={'/about'}>
              <Label className={navMenuItem}>About</Label>
            </Link>
            <Link href={'/dashboard'}>
              <Label className={navMenuItem}>Dashboard</Label>
            </Link>
            <Link href={'/explore'}>
              <Label className={navMenuItem}>Explore</Label>
            </Link>
            <a href="https://docs.nouns.build/" target="_blank" rel="noreferrer noopener">
              <Label className={navMenuItem}>Docs</Label>
            </a>
            <NetworkController.Mainnet>
              <Link href={'/bridge'}>
                <Label className={navMenuItem}>Bridge</Label>
              </Link>
            </NetworkController.Mainnet>
          </Flex>
        </Flex>

        <NavMenu />
      </Flex>
    </Flex>
  )
}
