import { useEnsData } from '@buildeross/hooks/useEnsData'
import { type PropDate } from '@buildeross/sdk/subgraph'
import { Avatar } from '@buildeross/ui/Avatar'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { InvoiceMetadata } from '@smartinvoicexyz/types'
import { useMemo } from 'react'

import { proposalDescription as messageStyle } from '../ProposalDescription/ProposalDescription.css'
import { PropDateReplyCard } from './PropDateReplyCard'

export const PropDateCard = ({
  propDate,
  isReplying,
  onReplyClick,
  replies = [],
  invoiceData,
}: {
  propDate: PropDate
  isReplying: boolean
  onReplyClick: (propDate: PropDate) => void
  replies?: PropDate[]
  invoiceData?: InvoiceMetadata
}) => {
  const { ensName, ensAvatar } = useEnsData(propDate?.creator)

  const milestoneTitle = useMemo(
    () =>
      typeof propDate.milestoneId === 'number' &&
      !!invoiceData?.milestones?.[propDate.milestoneId]?.title
        ? invoiceData.milestones[propDate.milestoneId].title
        : '',
    [invoiceData?.milestones, propDate.milestoneId]
  )

  const repliesSorted = useMemo(
    () => [...replies].sort((a, b) => a.timeCreated - b.timeCreated),
    [replies]
  )

  return (
    <Flex
      direction="column"
      borderStyle="solid"
      borderWidth="normal"
      borderColor="border"
      borderRadius="curved"
      backgroundColor="background1"
      mb="x2"
      px={{ '@initial': 'x2', '@768': 'x6' }}
      py="x6"
      mt="x4"
      gap="x4"
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap="x2">
        <Flex align="center" gap="x2">
          <Avatar address={propDate.creator} src={ensAvatar} size="28" />
          <Text fontWeight="display">{ensName || walletSnippet(propDate.creator)}</Text>
          <Text variant="label-sm" color="text3">
            • {new Date(propDate.timeCreated * 1000).toLocaleString()}
          </Text>
        </Flex>
        {milestoneTitle && (
          <Flex
            borderStyle="solid"
            borderRadius="phat"
            borderWidth="thin"
            py="x1"
            px="x3"
            color="text3"
            borderColor="border"
            align="center"
          >
            <Text variant="label-sm" style={{ fontWeight: 600 }}>
              {milestoneTitle}
            </Text>
          </Flex>
        )}
      </Flex>

      {propDate.message && (
        <Box
          borderRadius={'curved'}
          pt="x4"
          px="x4"
          backgroundColor={'background2'}
          className={messageStyle}
        >
          <MarkdownDisplay>{propDate.message}</MarkdownDisplay>
        </Box>
      )}
      {/* Render replies if any */}
      {repliesSorted && repliesSorted.length > 0 && (
        <Box mt="x4" ml="x4" style={{ borderLeft: '4px solid var(--colors-border)' }}>
          {repliesSorted.map((reply: PropDate) => (
            <PropDateReplyCard key={reply.id} reply={reply} />
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
