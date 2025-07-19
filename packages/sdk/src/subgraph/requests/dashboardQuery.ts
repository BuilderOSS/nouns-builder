import { SDK } from '../client'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import * as Sentry from '@sentry/nextjs'
import { isAddress } from 'viem'

export const dashboardRequest = async (memberAddress: string) => {
  try {
    if (!memberAddress) throw new Error('No user address provided')

    if (!isAddress(memberAddress)) throw new Error('Invalid user address')

    const data = await Promise.all(
      PUBLIC_DEFAULT_CHAINS.map((chain) =>
        SDK.connect(chain.id)
          .daosForDashboard({
            user: memberAddress.toLowerCase(),
            first: 30,
          })
          .then((x) => ({ ...x, chainId: chain.id })),
      ),
    )

    return data
      .map((queries) =>
        queries.daos.map((dao) => ({
          ...dao,
          name: dao.name || '',
          tokenAddress: dao.tokenAddress,
          auctionAddress: dao?.auctionAddress || '',
          proposals: dao.proposals,
          currentAuction: dao.currentAuction,
          chainId: queries.chainId,
          daoImage: dao.contractImage,
        })),
      )
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e: any) {
    console.error(e)
    Sentry.captureException(e)
    await Sentry.flush(2000)
    throw new Error(
      e?.message
        ? `Goldsky Request Error: ${e.message}`
        : 'Error fetching dashboard data from Goldsky subgraph.',
    )
  }
}
