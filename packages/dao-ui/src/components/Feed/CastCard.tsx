import { Box, Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useMemo } from 'react'

import { CasterProfile } from './Feed'
import { cardLink, cardWrapper, castText, pfpStyles, pfpWrapper } from './Feed.css'

export const CastCard = ({
  text,
  timestamp,
  hexHash,
  mentions,
  mentionsPositions,
  profile,
  mentionsfNames,
}: {
  text: string
  fid: number
  timestamp: number
  hexHash: string
  mentions: number[]
  mentionsPositions: number[]
  profile: CasterProfile
  mentionsfNames: string[]
}) => {
  const time = useMemo(() => {
    dayjs.extend(relativeTime)
    const date = dayjs.unix(timestamp / 1000).fromNow()
    return date
  }, [timestamp])

  const textWithMentions = useMemo(() => {
    if (!mentionsfNames || !text) return
    if (!mentions.length) return text

    const encoder = new TextEncoder()
    const bytes = encoder.encode(text)

    const decoder = new TextDecoder()
    let newText = ''
    let indexBytes = 0

    for (let i = 0; i < mentions.length; i++) {
      newText += decoder.decode(bytes.slice(indexBytes, mentionsPositions[i]))

      const fName = mentionsfNames[i]

      newText += '@' + fName

      indexBytes = mentionsPositions[i]
    }
    newText += decoder.decode(bytes.slice(indexBytes, bytes.length))

    return newText
  }, [text, mentionsfNames, mentions, mentionsPositions])

  return (
    <Box
      className={cardWrapper}
      py={{ '@initial': 'x4', '@768': 'x6' }}
      px={{ '@initial': 'x2', '@768': 'x6' }}
      borderRadius={'phat'}
      borderStyle={'solid'}
      borderWidth={'normal'}
      borderColor={'border'}
      mb={'x6'}
    >
      <Flex align={'center'} mb={'x4'}>
        <a
          className={cardLink}
          href={`https://warpcast.com/~/conversations/${hexHash}`}
          target="_blank"
        />
        <Box mr="x2" borderRadius="round">
          <div className={pfpWrapper}>
            <img
              alt="profile picture"
              src={profile?.pfp || '/nouns-avatar-circle.png'}
              className={pfpStyles}
            />
          </div>
        </Box>
        <Flex direction={{ '@initial': 'column', '@768': 'row' }}>
          <Text mr={'x1'} fontWeight={'display'}>
            {profile?.displayName || '@' + profile?.fName || 'Name Not Found'}
          </Text>
          <Flex>
            <Text color="text3" mr={'x1'}>
              @{profile?.fName || 'NotFound'}
            </Text>
            <Text color="text3" mr={'x1'}>
              -
            </Text>
            <Text color="text3">{time}</Text>
          </Flex>
        </Flex>
      </Flex>
      <Text className={castText}>{textWithMentions}</Text>
    </Box>
  )
}
