import { useEnsData } from '@buildeross/hooks'
import { type PropDate } from '@buildeross/sdk/eas'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Flex, Text } from '@buildeross/zord'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { Avatar } from 'src/components/Avatar'
import { useLayoutStore } from 'src/stores/useLayoutStore'

import { proposalDescription as messageStyle } from '../ProposalDescription/ProposalDescription.css'

export const PropDateReplyCard = ({ reply }: { reply: PropDate }) => {
  const { ensName, ensAvatar } = useEnsData(reply.attester)
  const isMobile = useLayoutStore((x) => x.isMobile)
  return (
    <Flex key={reply.txid} direction="row" gap="x2" align="flex-start" mb="x3">
      <Avatar address={reply.attester} src={ensAvatar} size={isMobile ? '20' : '28'} />
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
          <Text variant={isMobile ? 'label-sm' : 'label-md'} fontWeight="display">
            {ensName || walletSnippet(reply.attester)}
          </Text>
          <Text variant="label-sm" color="text3">
            • {new Date(reply.timeCreated * 1000).toLocaleDateString()}
          </Text>
        </Flex>
        <Box className={messageStyle}>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {reply.message}
          </ReactMarkdown>
        </Box>
      </Box>
    </Flex>
  )
}
