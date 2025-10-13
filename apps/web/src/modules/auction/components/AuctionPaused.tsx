import { auctionAbi } from '@buildeross/sdk/contract'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Stack } from '@buildeross/zord'
import { useChainStore, useDaoStore } from 'src/stores'
import { useReadContract } from 'wagmi'

export const AuctionPaused: React.FC = () => {
  const chain = useChainStore((x) => x.chain)
  const { getDaoLink } = useLinks()

  const addresses = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  if (!paused) return null

  return (
    <Stack align={'center'} w="100%" mt="x7">
      <Box color="text3" fontSize={18}>
        Auctions have been paused.
      </Box>
      {addresses.token && (
        <Link
          link={getDaoLink(chain.id, addresses.token, 'activity')}
          display={'inline-flex'}
          color="text3"
          mt="x1"
          fontSize={18}
          className={atoms({ textDecoration: 'underline' })}
        >
          See activity
        </Link>
      )}
    </Stack>
  )
}
