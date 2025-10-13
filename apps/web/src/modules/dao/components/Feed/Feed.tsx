import { BASE_URL } from '@buildeross/constants/baseUrl'
import { useChainStore } from '@buildeross/stores'
import { DisplayPanel } from '@buildeross/ui/DisplayPanel'
import { Button, Flex } from '@buildeross/zord'
import { CastAddData, Message, SignatureScheme } from '@farcaster/hub-nodejs'
import axios from 'axios'
import React, { useMemo } from 'react'
import useSWRInfinite from 'swr/infinite'

import { CardSkeleton } from './CardSkeleton'
import { CastCard } from './CastCard'
import { loadMoreButton } from './Feed.css'
import { FeedTab } from './FeedTab'

type FeedTabProps = {
  collectionAddress: string
}

export type CasterProfile = {
  displayName?: string
  pfp?: string
  fName?: string
}

type AddMsgWithUnix = Message & {
  data: CastAddData
  unixTime: number
  hexHash: string
  signatureScheme: SignatureScheme.ED25519
  profile: CasterProfile
  mentionsfNames: string[]
}
type PageData = { value: AddMsgWithUnix[]; nextPageToken?: string }

export const Feed = ({ collectionAddress }: FeedTabProps) => {
  const chain = useChainStore((x) => x.chain)

  const { data, error, isValidating, setSize } = useSWRInfinite(
    (_pageIndex: number, prevPageData: PageData) => {
      if (prevPageData && !prevPageData.nextPageToken) return null
      return `${BASE_URL}/api/feed/${collectionAddress}:${chain.id}:${
        prevPageData?.nextPageToken || ''
      }`
    },
    (url) =>
      axios.get<PageData>(url).then((x) => {
        return x.data
      })
  )

  const { casts } = useMemo(() => {
    if (!data) return {}
    return { casts: data.flatMap((pageData) => pageData.value) }
  }, [data])

  const loadMore = () => {
    setSize((size) => size + 1)
  }

  if (error) {
    return (
      <FeedTab>
        <Flex
          justify="center"
          align="center"
          width="100%"
          height="100%"
          direction="column"
        >
          <DisplayPanel title="Error" description={error?.message || 'Unknown Error'} />
        </Flex>
      </FeedTab>
    )
  }

  if (isValidating && !casts?.length) {
    return (
      <FeedTab>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </FeedTab>
    )
  }
  // this shouldn't occur. Keeping this here for next update.
  if (!casts?.length) {
    return (
      <FeedTab>
        <Flex
          justify="center"
          align="center"
          width="100%"
          height="100%"
          direction="column"
        >
          <DisplayPanel
            title="No casts found"
            description="A channel feed has not been created for this DAO."
          />
        </Flex>
      </FeedTab>
    )
  }

  return (
    <FeedTab>
      {casts?.map((msg) => (
        <CastCard
          key={msg.hexHash}
          text={msg?.data?.castAddBody?.text}
          fid={msg.data.fid}
          timestamp={msg.unixTime}
          hexHash={msg.hexHash}
          mentions={msg?.data?.castAddBody?.mentions}
          mentionsPositions={msg?.data?.castAddBody?.mentionsPositions}
          profile={msg.profile}
          mentionsfNames={msg.mentionsfNames}
        />
      ))}
      <Button onClick={loadMore} loading={isValidating} className={loadMoreButton}>
        Load More
      </Button>
    </FeedTab>
  )
}
