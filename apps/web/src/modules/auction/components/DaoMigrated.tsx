import { Box, Stack, atoms } from '@buildeross/zord'
import Link from 'next/link'
import { useReadContract } from 'wagmi'

import { Icon } from 'src/components/Icon'
import { PUBLIC_ALL_CHAINS } from 'src/constants/chains'
import { auctionAbi } from 'src/data/contract/abis'
import { useDaoStore } from 'src/modules/dao'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType, CHAIN_ID } from 'src/typings'

export const DaoMigrated = ({
  l2ChainId,
  l2TokenAddress,
}: {
  l2ChainId: CHAIN_ID
  l2TokenAddress: AddressType
}) => {
  const { id: chainId } = useChainStore((x) => x.chain)
  const migratedToChain = PUBLIC_ALL_CHAINS.find((x) => x.id === l2ChainId)

  const { auction } = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    functionName: 'paused',
    chainId,
  })

  if (!paused) return null

  return (
    <Stack align={'center'} w="100%" mt="x7">
      <Box color="text3" fontSize={18}>
        This DAO has been migrated to L2.
      </Box>
      <Link href={`/dao/${migratedToChain?.slug}/${l2TokenAddress}`}>
        <Box
          display={'inline-flex'}
          color="text3"
          mt="x1"
          fontSize={18}
          className={atoms({ textDecoration: 'underline' })}
        >
          View DAO on L2
          <Icon align="center" fill="text4" id="external-16" size="sm" />
        </Box>
      </Link>
    </Stack>
  )
}
