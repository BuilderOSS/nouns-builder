import { Box, Flex, Text } from '@zoralabs/zord'

import { Avatar } from 'src/components/Avatar'
import { type PropDate } from 'src/data/eas/requests/getPropDates'
import { useEnsData } from 'src/hooks'
import { useLayoutStore } from 'src/stores/useLayoutStore'
import { walletSnippet } from 'src/utils/helpers'

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
        p="x4"
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
        <Text
          variant={isMobile ? 'paragraph-sm' : 'paragraph-md'}
          textAlign={'left'}
          style={{
            fontWeight: 400,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {reply.message}
        </Text>
      </Box>
    </Flex>
  )
}
