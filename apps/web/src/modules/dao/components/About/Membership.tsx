import { Box, Flex, Grid, PopUp, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import React, { useState } from 'react'

import { Avatar } from 'src/components/Avatar/Avatar'
import { Icon } from 'src/components/Icon'
import { type DaoMembership } from 'src/hooks/useDaoMembership'
import { useLayoutStore } from 'src/stores'

export const Membership: React.FC<DaoMembership & { totalSupply: number }> = (info) => {
  const {
    member,
    delegate,
    voteCount,
    tokenCount,
    timeJoined,
    totalSupply,
    voteDescription,
  } = info
  const { isMobile } = useLayoutStore()

  const joinedDate = dayjs(dayjs.unix(timeJoined)).format('MMM DD, YYYY')
  const votePercent = ((Number(voteCount) / totalSupply) * 100).toFixed(2)
  const voteInfo = `${voteCount} Token${voteCount === 1 ? '' : 's'} (${votePercent}%)`

  return (
    <Flex direction="column" gap="x2" mt={{ '@initial': 'x4', '@768': 'x10' }}>
      <Text variant="heading-xs" style={{ fontWeight: 800 }}>
        Membership
      </Text>
      <Grid columns={isMobile ? 1 : 2} gap="x4" pt="x4">
        <MembershipCard
          label="Member"
          value={
            <Flex align="center" gap="x2">
              <Avatar address={member.ethAddress} src={member.ensAvatar} size="32" />
              <Text mx="x2" variant="paragraph-md">
                {member.displayName}
              </Text>
            </Flex>
          }
        />
        {delegate.ethAddress !== member.ethAddress && (
          <MembershipCard
            label="Delegate"
            value={
              <Flex align="center" gap="x2">
                <Avatar
                  address={delegate.ethAddress}
                  src={delegate.ensAvatar}
                  size="32"
                />
                <Text mx="x2" variant="paragraph-md">
                  {delegate.displayName}
                </Text>
              </Flex>
            }
          />
        )}
        <MembershipCard
          label="Tokens Held"
          value={`${tokenCount} Token${tokenCount === 1 ? '' : 's'}`}
        />
        <MembershipCard label="Voting Power" value={voteInfo} tooltip={voteDescription} />
        <MembershipCard label="Joined" value={joinedDate} />
      </Grid>
    </Flex>
  )
}

const MembershipCard: React.FC<{
  label: string
  value: string | number | React.ReactElement
  tooltip?: string | React.ReactElement
}> = ({ label, value, tooltip }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  return (
    <Flex
      borderRadius="curved"
      borderStyle="solid"
      borderWidth="normal"
      borderColor="border"
      direction="row"
      align="center"
      justify="space-between"
      gap="x4"
      p={{ '@initial': 'x4', '@768': 'x6' }}
      w="100%"
    >
      {/* Member */}
      <Text fontWeight="label">{label}</Text>
      <Flex align={'center'} justify="center" gap="x2">
        {typeof value === 'string' ? <Text variant="paragraph-md">{value}</Text> : value}
        {!!tooltip && (
          <>
            <Box
              cursor="pointer"
              style={{ zIndex: 102 }}
              onMouseOver={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Icon id="info-16" size="sm" />
            </Box>
            <PopUp open={showTooltip} trigger={<></>}>
              <Box>{tooltip}</Box>
            </PopUp>
          </>
        )}
      </Flex>
    </Flex>
  )
}
