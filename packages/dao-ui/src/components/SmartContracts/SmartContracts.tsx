import { useEscrowDelegate } from '@buildeross/hooks/useEscrowDelegate'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractLink } from '@buildeross/ui/ContractLink'
import { Box, Flex, Grid, Text, vars } from '@buildeross/zord'

import { about, contractItemGrid } from '../../styles/About.css'

const Contract = ({ title, address }: { title: string; address: string }) => {
  const chain = useChainStore((x) => x.chain)
  return (
    <Grid className={contractItemGrid} align={'center'}>
      <Text fontWeight={'display'} py={{ '@initial': 'x2', '@768': 'x0' }}>
        {title}
      </Text>
      <ContractLink address={address} chainId={chain.id} />
    </Grid>
  )
}

export const SmartContracts = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const { escrowDelegate } = useEscrowDelegate({
    chainId: chain.id,
    tokenAddress: addresses.token,
    treasuryAddress: addresses.treasury,
  })

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
          {addresses.token && <Contract title="NFT" address={addresses.token} />}
          {addresses.auction && (
            <Contract title="Auction House" address={addresses.auction} />
          )}
          {addresses.governor && (
            <Contract title="Governor" address={addresses.governor} />
          )}
          {addresses.treasury && (
            <Contract title="Treasury" address={addresses.treasury} />
          )}
          {addresses.metadata && (
            <Contract title="Metadata" address={addresses.metadata} />
          )}
          {escrowDelegate && (
            <Contract title="Escrow Delegate" address={escrowDelegate} />
          )}
        </Flex>
      </Flex>
    </Box>
  )
}
