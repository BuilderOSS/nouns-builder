import { useEnsData } from '@buildeross/hooks/useEnsData'
import { type PropDate } from '@buildeross/sdk/subgraph'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { MarkdownDisplay } from '@buildeross/ui/MarkdownDisplay'
import { formatTimeAgo } from '@buildeross/utils/formatTime'
import { walletSnippet } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { InvoiceMetadata } from '@smartinvoicexyz/types'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { proposalDescription as messageStyle } from '../ProposalDescription/ProposalDescription.css'
import { fadingMessage, PROPDATE_COLLAPSED_HEIGHT } from './PropDateCard.css'
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

  // Collapse long milestone reports so the feed stays scannable. Mirrors the
  // About-page DaoDescription pattern: measure the rendered message and only
  // clamp + show a toggle when it actually overflows the collapsed height.
  const [isOverHeight, setIsOverHeight] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)
  const messageId = useId()

  const collapsedHeight = useMemo(
    () => Number.parseInt(PROPDATE_COLLAPSED_HEIGHT, 10),
    []
  )

  const updateOverflowState = useCallback(() => {
    const contentHeight = messageRef.current?.scrollHeight || 0
    setIsOverHeight(contentHeight > collapsedHeight)
  }, [collapsedHeight])

  useEffect(() => {
    setIsExpanded(false)
  }, [propDate.message])

  useEffect(() => {
    updateOverflowState()
    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => updateOverflowState())
      if (messageRef.current) observer.observe(messageRef.current)
    }
    window.addEventListener('resize', updateOverflowState)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateOverflowState)
    }
  }, [propDate.message, updateOverflowState])

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
      <Flex justify="space-between" align="center" gap="x2" style={{ minWidth: 0 }}>
        <Flex align="center" gap="x2" style={{ minWidth: 0 }}>
          <Box style={{ minWidth: 0 }}>
            <WalletIdentityWithPreview
              address={propDate.creator as `0x${string}`}
              displayName={ensName || walletSnippet(propDate.creator)}
              avatarSrc={ensAvatar}
              avatarSize="28"
              mobileTapBehavior="toggle"
            />
          </Box>
          <Text
            variant="label-sm"
            color="text3"
            style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            • {formatTimeAgo(propDate.timeCreated)}
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
            style={{ maxWidth: 220, flexShrink: 0 }}
          >
            <Text
              variant="label-sm"
              style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {milestoneTitle}
            </Text>
          </Flex>
        )}
      </Flex>

      {propDate.message && (
        <Box>
          <Box
            ref={messageRef}
            id={messageId}
            borderRadius={'curved'}
            pt="x4"
            px="x4"
            backgroundColor={'background2'}
            className={[messageStyle, !isExpanded && isOverHeight ? fadingMessage : '']
              .filter(Boolean)
              .join(' ')}
            style={{
              maxHeight: isExpanded ? 'none' : PROPDATE_COLLAPSED_HEIGHT,
              overflow: isExpanded ? 'visible' : 'hidden',
            }}
          >
            <MarkdownDisplay>{propDate.message}</MarkdownDisplay>
          </Box>
          {isOverHeight && (
            <Flex justify="center" mt="x2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded((v) => !v)}
                aria-expanded={isExpanded}
                aria-controls={messageId}
              >
                {isExpanded ? (
                  'Show less'
                ) : (
                  <Flex align="center" gap="x1">
                    <Text as="span">Read full update</Text>
                    <Icon id="arrow-right" size="sm" />
                  </Flex>
                )}
              </Button>
            </Flex>
          )}
        </Box>
      )}
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
