import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Box, Flex } from '@buildeross/zord'
import React from 'react'
import { Feed } from 'src/components/Feed'

export const DaoFeed: React.FC = () => {
  const chain = useChainStore((x) => x.chain)
  const { token } = useDaoStore((x) => x.addresses)

  return (
    <Box m="auto" style={{ maxWidth: 912 }}>
      <Flex direction={'column'}>
        <Box mb={{ '@initial': 'x4', '@768': 'x8' }}>
          <Flex
            direction={'column'}
            py={{ '@initial': 'x0', '@768': 'x4' }}
            mt={'x4'}
            mb={'x8'}
          >
            {token && <Feed chainId={chain.id} daoAddress={token} />}
          </Flex>
        </Box>
      </Flex>
    </Box>
  )
}
