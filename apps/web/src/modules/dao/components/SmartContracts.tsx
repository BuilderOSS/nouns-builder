import { Box, Flex, Grid, Text, vars } from '@buildeross/zord'
import React from 'react'

import { useLayoutStore } from 'src/stores'
import { about } from 'src/styles/About.css'

import { useDaoStore } from '../stores'
import { ContractLink } from './ContractLink'

const Contract = ({ title, address }: { title: string; address?: string }) => {
  const { isMobile } = useLayoutStore()

  return (
    <Grid columns={isMobile ? 1 : '1fr 3fr'} align={'center'}>
      <Text fontWeight={'display'} py={{ '@initial': 'x2', '@768': 'x0' }}>
        {title}
      </Text>
      <ContractLink address={address} />
    </Grid>
  )
}

export const SmartContracts = () => {
  const { addresses } = useDaoStore()

  return (
    <Box className={about}>
      <Flex direction={'column'}>
        <Box mb={{ '@initial': 'x4', '@768': 'x8' }}>
          <Text
            mb={{ '@initial': 'x4', '@768': 'x6' }}
            fontSize={28}
            fontWeight={'display'}
          >
            Smart Contracts
          </Text>
          <Text>
            You can find the latest information on the Nouns Builder protocol on{' '}
            <Text
              as={'a'}
              href="https://github.com/ourzora/nouns-protocol"
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: vars.fontWeight.display, textDecoration: 'underline' }}
            >
              Github
            </Text>
            . Upgrades to these smart contract can be completed by submitting a proposal
            to the DAO, and requires a successful vote to execute.
          </Text>
        </Box>
        <Flex direction={'column'} gap={'x4'}>
          <Contract title="NFT" address={addresses.token} />
          <Contract title="Auction House" address={addresses.auction} />
          <Contract title="Governor" address={addresses.governor} />
          <Contract title="Treasury" address={addresses.treasury} />
          <Contract title="Metadata" address={addresses.metadata} />
          {addresses?.escrowDelegate && (
            <Contract title="Escrow Delegate" address={addresses.escrowDelegate} />
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
