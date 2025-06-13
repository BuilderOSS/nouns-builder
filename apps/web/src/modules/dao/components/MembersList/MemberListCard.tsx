import { Flex, Text } from '@zoralabs/zord'
import dayjs from 'dayjs'
import Link from 'next/link'
import React, { useMemo } from 'react'

import { Avatar } from 'src/components/Avatar'
import { DaoVoter } from 'src/data/subgraph/requests/daoVoters'
import { useEnsData } from 'src/hooks'

import { firstRowItem, lastRowItem, rowItem } from './MembersList.css'

export const MemberCard = ({
  member,
  totalSupply,
  isMobile,
}: {
  member: DaoVoter
  totalSupply?: number
  isMobile: boolean
}) => {
  const { displayName, ensAvatar } = useEnsData(member.voter)

  const timeJoined = useMemo(
    () => dayjs(dayjs.unix(member.timeJoined)).format('MMM DD, YYYY'),
    [member]
  )

  const votePercent = useMemo(() => {
    if (!totalSupply || !member.tokenCount) return '--'
    return ((Number(member.tokenCount) / totalSupply) * 100).toFixed(2)
  }, [totalSupply, member])

  const gridInfo = (
    <>
      <Text className={rowItem}>
        {member.tokenCount} Token{member.tokenCount === 1 ? '' : 's'}
      </Text>
      <Text className={rowItem}>{votePercent}%</Text>
      <Text className={lastRowItem}>{timeJoined}</Text>
    </>
  )

  return (
    <Link href={`/profile/${member.voter}`} passHref>
      <Flex
        mb={'x14'}
        direction={{ '@initial': 'column', '@768': 'row' }}
        align={{ '@initial': 'start', '@768': 'center' }}
      >
        <Flex
          className={firstRowItem}
          align={'center'}
          mb={{ '@initial': 'x4', '@768': 'x0' }}
        >
          <Avatar address={member.voter} src={ensAvatar} size="32" />
          <Text mx="x2" variant="paragraph-md">
            {displayName}
          </Text>
        </Flex>
        {isMobile ? <Flex w="100%">{gridInfo}</Flex> : gridInfo}
      </Flex>
    </Link>
  )
}
