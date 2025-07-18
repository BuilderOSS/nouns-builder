import { farcasterClient } from '../client'
import { getFarcasterProfile, getfName } from './farcasterProfile.ts'
import { hexStringToBytes, isCastAddMessage } from '@farcaster/hub-nodejs'

const createChannelString = (collectionAddress: string, chainId: string) => {
  return `chain://eip155:${chainId}/erc721:${collectionAddress}`
}

const handleMentions = async (fIDs: number[], mentionsPositions: number[]) => {
  if (!fIDs || !mentionsPositions) return []

  const res = await Promise.all(
    fIDs.map(async (fid) => {
      const res = await getfName(fid)
      return res?.fName || null
    }),
  )

  return res
}

export const getDAOfeed = async (feedId: string) => {
  const client = farcasterClient()

  const [collectionAddress, chainId, nextToken] = feedId.split(':')

  const nextBufferArray =
    nextToken?.slice(0, 2) === '0x'
      ? hexStringToBytes(nextToken)._unsafeUnwrap()
      : undefined

  const res = await client.getCastsByParent({
    parentUrl: createChannelString(collectionAddress, chainId),
    reverse: true,
    pageSize: 5,
    pageToken: nextBufferArray,
  })

  client.close()

  if (res.isErr()) {
    throw new Error(res.error.message)
  }

  // Coerce Messages into Casts, should not actually filter out any messages
  const casts = res.value.messages.filter(isCastAddMessage)

  try {
    const castsWithProfiles = await Promise.all(
      casts.map(async (cast) => {
        const [profile, mentionsfNames] = await Promise.all([
          getFarcasterProfile(cast.data.fid),
          handleMentions(
            cast.data.castAddBody.mentions,
            cast.data.castAddBody.mentionsPositions,
          ),
        ])
        return {
          ...cast,
          profile,
          mentionsfNames,
        }
      }),
    )
    return {
      data: castsWithProfiles.filter((msg) => !msg.data.castAddBody.parentCastId),
      nextPageToken: res.value.nextPageToken,
    }
  } catch (error) {
    console.error('error', error)
    throw new Error(error as any)
  }
}
