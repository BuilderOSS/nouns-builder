import { useEnsData } from '@buildeross/hooks/useEnsData'
import { type PropDate } from '@buildeross/sdk/eas'
import { Avatar } from '@buildeross/ui/Avatar'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'

import { proposalDescription as messageStyle } from '../ProposalDescription/ProposalDescription.css'

export const PropDateReplyCard = ({ reply }: { reply: PropDate }) => {
  const { ensName, ensAvatar } = useEnsData(reply.attester)
  return (
    <Flex key={reply.txid} direction="row" gap="x2" align="flex-start" mb="x3">
      <Avatar address={reply.attester} src={ensAvatar} size="24" />
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
          <Text fontWeight="display">{ensName || walletSnippet(reply.attester)}</Text>
          <Text variant="label-sm" color="text3">
            • {new Date(reply.timeCreated * 1000).toLocaleDateString()}
          </Text>
        </Flex>
        <Box className={messageStyle}>
          <MarkdownDisplay>{reply.message}</MarkdownDisplay>
        </Box>
      </Box>
    </Flex>
  )
}
