import { BASE_URL } from '@buildeross/constants'
import { auctionAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { atoms, Box, Stack } from '@buildeross/zord'
import { useChainStore, useDaoStore } from 'src/stores'
import { useReadContract } from 'wagmi'

export const DaoMigrated = ({
  l2ChainId,
  l2TokenAddress,
  onOpenDao,
}: {
  l2ChainId: CHAIN_ID
  l2TokenAddress: AddressType
  onOpenDao?: (chainId: CHAIN_ID, tokenAddress: AddressType) => void
}) => {
  const { id: chainId } = useChainStore((x) => x.chain)

  const { auction } = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    functionName: 'paused',
    chainId,
  })

  const linkProps = onOpenDao
    ? { onClick: () => onOpenDao(l2ChainId, l2TokenAddress) }
    : {
        as: 'a',
        href: `${BASE_URL}/dao/${l2ChainId}/${l2TokenAddress}`,
        target: '_blank',
        rel: 'noreferrer noopener',
      }

  if (!paused) return null

  return (
    <Stack align={'center'} w="100%" mt="x7">
      <Box color="text3" fontSize={18}>
        This DAO has been migrated to L2.
      </Box>
      <Box
        {...linkProps}
        display="inline-flex"
        color="text3"
        mt="x1"
        fontSize={18}
        className={atoms({ textDecoration: 'underline' })}
        cursor="pointer"
      >
        View DAO on L2
      </Box>
    </Stack>
  )
}
