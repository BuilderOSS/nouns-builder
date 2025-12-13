import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { isAddress } from 'viem'

import { SDK } from '../client'

export type MyDaosResponse = Array<{
  name: string
  contractImage: string
  collectionAddress: string
  metadataAddress: string
  treasuryAddress: string
  governorAddress: string
  auctionAddress: string
  chainId: CHAIN_ID
}>

export const myDaosRequest = async (memberAddress: string): Promise<MyDaosResponse> => {
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
          .then((x) => ({ ...x, chainId: chain.id }))
      )
    )

    return data
      .map((queries) =>
        queries.daos.map((dao) => ({
          name: dao.name || '',
          contractImage: dao.contractImage || '',
          collectionAddress: dao.tokenAddress,
          metadataAddress: dao.metadataAddress,
          treasuryAddress: dao.treasuryAddress,
          governorAddress: dao.governorAddress,
          auctionAddress: dao.auctionAddress,
          chainId: queries.chainId,
        }))
      )
      .flat()
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (e: any) {
    console.error('Error fetching my DAOs:', e)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
  }

  return daos
}
