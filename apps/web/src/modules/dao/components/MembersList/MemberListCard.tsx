import { useEnsData } from '@buildeross/hooks/useEnsData'
import { DaoVoter } from '@buildeross/sdk/subgraph'
import { ProfileLinkHandler } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Flex, Grid, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useMemo } from 'react'

export const MemberCard = ({
  member,
  totalSupply,
  getProfileLink,
}: {
  member: DaoVoter
  totalSupply?: number
  getProfileLink?: ProfileLinkHandler
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

  return (
    <Link
      link={getProfileLink?.(member.voter)}
      mb={'x14'}
      direction={{ '@initial': 'column', '@768': 'row' }}
      align={{ '@initial': 'start', '@768': 'center' }}
    >
      <Flex
        style={{ width: '35%' }}
        align={'center'}
        mb={{ '@initial': 'x4', '@768': 'x0' }}
      >
        <Avatar address={member.voter} src={ensAvatar} size="32" />
        <Text mx="x2" variant="paragraph-md">
          {displayName}
        </Text>
      </Flex>
      <Grid columns="1fr 1fr 1fr" flex={1} width={{ '@initial': '100%', '@768': 'auto' }}>
        <Text>
          {member.tokenCount} Token{member.tokenCount === 1 ? '' : 's'}
        </Text>
        <Text>{votePercent}%</Text>
        <Text>{timeJoined}</Text>
      </Grid>
    </Link>
  )
}
