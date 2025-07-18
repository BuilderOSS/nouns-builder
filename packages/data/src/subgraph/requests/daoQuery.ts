import { SDK } from '../client'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'
import { isAddress } from 'viem'

export type MyDaosResponse = Array<{
  name: string
  contractImage: string
  collectionAddress: string
  auctionAddress: string
  chainId: CHAIN_ID
}>

export const myDaosRequest = async (
  memberAddress: string,
): Promise<MyDaosResponse> => {
  let daos: MyDaosResponse = []

  if (!memberAddress) throw new Error('No user address provided')

  if (!isAddress(memberAddress)) throw new Error('Invalid user address')

  try {
    const data = await Promise.all(
      PUBLIC_DEFAULT_CHAINS.map((chain) =>
        SDK.connect(chain.id)
          .daosForUser({
            user: memberAddress.toLowerCase(),
            first: 30,
          })
          .then((x) => ({ ...x, chainId: chain.id })),
      ),
    )

    return data
      .map((queries) =>
        queries.daos.map((dao) => ({
          name: dao.name || '',
          contractImage: dao.contractImage || '',
          collectionAddress: dao.tokenAddress,
          auctionAddress: dao?.auctionAddress || '',
          chainId: queries.chainId,
        })),
      )
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e: any) {
    console.error('Error fetching my DAOs:', e)
    Sentry.captureException(e)
    await Sentry.flush(2000)
  }

  return daos
}
