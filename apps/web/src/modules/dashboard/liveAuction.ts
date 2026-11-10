import type { AuctionStatusResponse, DashboardDaoWithState } from '@buildeross/hooks'
import type { CHAIN_ID } from '@buildeross/types'

/**
 * Overlays polled auction status onto dashboard DAOs. The dashboard payload is
 * cached for minutes, so the live status keeps auction cards current without
 * refetching it.
 */
export const withLiveAuctions = (
  daos: DashboardDaoWithState[],
  statusByChain: Partial<Record<CHAIN_ID, AuctionStatusResponse>> | undefined
): DashboardDaoWithState[] => {
  if (!statusByChain) return daos

  return daos.map((dao) => {
    const auctions = statusByChain[dao.chainId]?.auctions
    const daoId = dao.tokenAddress.toLowerCase()
    // DAOs the API couldn't resolve are omitted; keep the cached data
    if (!auctions || !(daoId in auctions)) return dao

    const status = auctions[daoId]
    if (!status) return { ...dao, currentAuction: null }

    return {
      ...dao,
      currentAuction: {
        ...dao.currentAuction,
        endTime: String(status.endTime),
        highestBid: status.highestBid,
        token: {
          ...dao.currentAuction?.token,
          tokenId: status.tokenId,
          name: status.token.name,
          image: status.token.image,
        },
      },
    }
  })
}
