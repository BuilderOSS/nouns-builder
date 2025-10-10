import { auctionAbi } from '@buildeross/sdk/contract'
import { atoms, Box, Stack } from '@buildeross/zord'
import { useChainStore, useDaoStore } from 'src/stores'
import { useReadContract } from 'wagmi'

interface AuctionPausedProps {
  handleOpenDaoActivity?: () => void
}

export const AuctionPaused: React.FC<AuctionPausedProps> = ({
  handleOpenDaoActivity,
}) => {
  const chain = useChainStore((x) => x.chain)

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
      {handleOpenDaoActivity && (
        <Box
          display={'inline-flex'}
          color="text3"
          mt="x1"
          fontSize={18}
          className={atoms({ textDecoration: 'underline' })}
          onClick={handleOpenDaoActivity}
          cursor={'pointer'}
        >
          See activity
        </Box>
      )}
    </Stack>
  )
}
