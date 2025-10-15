import { useEnsData } from '@buildeross/hooks/useEnsData'
import { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
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
  const { getProfileLink } = useLinks()

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
      <Link direction={'row'} align={'center'} link={getProfileLink?.(wallet)} flex={1}>
        <Avatar address={wallet} src={ensAvatar} size={'40'} />
        <Flex direction={'column'} ml={'x2'}>
          <Text fontWeight={'display'}>{displayName}</Text>
        </Flex>
      </Link>
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
