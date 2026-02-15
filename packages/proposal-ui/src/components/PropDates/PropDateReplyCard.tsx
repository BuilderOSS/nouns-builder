import { useEnsData } from '@buildeross/hooks/useEnsData'
import { type PropDate } from '@buildeross/sdk/subgraph'
import { Avatar } from '@buildeross/ui/Avatar'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'

import { proposalDescription as messageStyle } from '../ProposalDescription/ProposalDescription.css'

export const PropDateReplyCard = ({ reply }: { reply: PropDate }) => {
  const { ensName, ensAvatar } = useEnsData(reply.creator)
  return (
    <Flex direction="row" gap="x2" align="flex-start" mb="x3">
      <Avatar address={reply.creator} src={ensAvatar} size="24" />
      <Box
        backgroundColor="background2"
        borderRadius="curved"
        borderColor="border"
        borderWidth="normal"
        borderStyle="solid"
        pt="x4"
        px="x4"
        style={{ width: '100%', minWidth: 0 }}
      >
        <Flex align="center" gap="x2" mb="x1">
          <Text fontWeight="display">{ensName || walletSnippet(reply.creator)}</Text>
          <Text variant="label-sm" color="text3">
            • {formatTimeAgo(reply.timeCreated)}
          </Text>
        </Flex>
        <Box className={messageStyle}>
          <MarkdownDisplay>{reply.message}</MarkdownDisplay>
        </Box>
      </Box>
    </Flex>
  )
}
