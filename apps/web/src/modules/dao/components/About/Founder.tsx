import { useEnsData } from '@buildeross/hooks'
import { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui'
import { Box, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import { useState } from 'react'

interface FounderProps {
  wallet: AddressType
  ownershipPct: number
  vestExpiry: number
}

export const Founder: React.FC<FounderProps> = ({ wallet, ownershipPct, vestExpiry }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const { displayName, ensAvatar } = useEnsData(wallet as string)
  const vestDate = new Date(vestExpiry * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return (
    <Flex
      direction={'row'}
      align={'center'}
      justify={'space-between'}
      w={'100%'}
      borderStyle="solid"
      borderColor="border"
      borderWidth="normal"
      borderRadius="curved"
      p="x4"
      px="x6"
    >
      <Flex direction={'row'} align={'center'}>
        <Avatar address={wallet} src={ensAvatar} size={'40'} />
        <Flex direction={'column'} ml={'x2'}>
          <Text
            as="a"
            target="_blank"
            rel="noreferrer noopener"
            href={`/profile/${wallet}`}
            fontWeight={'display'}
          >
            {displayName}
          </Text>
        </Flex>
      </Flex>
      <Flex align={'center'} justify="center">
        <Text fontWeight={'display'} mr="x2">
          {ownershipPct}%
        </Text>
        <Box
          cursor="pointer"
          style={{ zIndex: 102 }}
          onMouseOver={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Icon id="info-16" size="sm" />
        </Box>
        <PopUp open={showTooltip} trigger={<></>}>
          <Box>{`In effect until ${vestDate}`}</Box>
        </PopUp>
      </Flex>
    </Flex>
  )
}
