import { InvoiceMetadata } from '@smartinvoicexyz/types'
import { Box, Button, Flex, Text } from '@zoralabs/zord'

import { Avatar } from 'src/components/Avatar'
import { type PropDate } from 'src/data/eas/requests/getPropDates'
import { useEnsData } from 'src/hooks'
import { useLayoutStore } from 'src/stores/useLayoutStore'
import { walletSnippet } from 'src/utils/helpers'

import { PropDateReplyCard } from './PropDateReplyCard'

export const PropDateCard = ({
  propDate,
  index,
  isReplying,
  onReplyClick,
  replies = [],
  invoiceData,
}: {
  propDate: PropDate
  index: number
  isReplying: boolean
  onReplyClick: (propDate: PropDate) => void
  replies?: PropDate[]
  invoiceData?: InvoiceMetadata
}) => {
  const isMobile = useLayoutStore((x) => x.isMobile)
  const { ensName, ensAvatar } = useEnsData(propDate?.attester)

  const milestoneTitle =
    typeof propDate.milestoneId === 'number' &&
    !!invoiceData?.milestones?.[propDate.milestoneId]?.title
      ? invoiceData.milestones[propDate.milestoneId].title
      : ''

  return (
    <Flex
      direction="column"
      borderStyle="solid"
      borderWidth="normal"
      borderColor="border"
      borderRadius="curved"
      backgroundColor="background1"
      mb="x2"
      px={isMobile ? 'x2' : 'x6'}
      py="x6"
      mt="x4"
      gap="x4"
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap="x2">
        <Flex align="center" gap="x2">
          <Avatar
            address={propDate.attester}
            src={ensAvatar}
            size={isMobile ? '24' : '32'}
          />
          <Text variant={isMobile ? 'label-sm' : 'label-md'} fontWeight="display">
            {ensName || walletSnippet(propDate.attester)}
          </Text>
          {milestoneTitle && (
            <Text variant="label-sm" color="text3">
              • {milestoneTitle}
            </Text>
          )}
          <Text variant="label-sm" color="text3">
            • {new Date(propDate.timeCreated * 1000).toLocaleDateString()}
          </Text>
        </Flex>
        <Box
          borderStyle="solid"
          borderRadius="phat"
          borderWidth="thin"
          py="x1"
          px="x3"
          color="text3"
          borderColor="border"
        >
          <Text variant="label-sm" style={{ fontWeight: 600 }}>
            Update #{index + 1}
          </Text>
        </Box>
      </Flex>

      {propDate.message && (
        <Box borderRadius={'curved'} p={'x4'} backgroundColor={'background2'}>
          <Text
            variant={isMobile ? 'paragraph-sm' : 'paragraph-md'}
            textAlign={'left'}
            style={{
              fontWeight: 400,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {propDate.message}
          </Text>
        </Box>
      )}
      {/* Render replies if any */}
      {replies && replies.length > 0 && (
        <Box mt="x4" ml="x4" style={{ borderLeft: '4px solid var(--colors-border)' }}>
          {replies.map((reply: PropDate) => (
            <PropDateReplyCard key={reply.txid} reply={reply} />
          ))}
        </Box>
      )}
      <Flex justify="flex-end">
        <Button
          variant={isReplying ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => onReplyClick(propDate)}
        >
          {isReplying ? 'Cancel Reply' : 'Reply'}
        </Button>
      </Flex>
    </Flex>
  )
}
