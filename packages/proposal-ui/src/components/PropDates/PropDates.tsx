import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { useInvoiceData } from '@buildeross/hooks/useInvoiceData'
import { getPropDates, type PropDate, type Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { getEscrowBundler, getEscrowBundlerV1 } from '@buildeross/utils/escrow'
import { Box, Button, Flex, Icon, Text } from '@buildeross/zord'
import { toLower } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'
import { zeroHash } from 'viem'

import { propPageWrapper } from '../styles.css'
import { PropDateCard } from './PropDateCard'
import { PropDateForm } from './PropDateForm'
import { useDaoMembers } from './useDaoMembers'

interface PropDatesProps {
  proposal: Proposal
}

export const PropDates = ({ proposal }: PropDatesProps) => {
  const chain = useChainStore((x) => x.chain)
  const {
    addresses: { token },
  } = useDaoStore()

  const { data, mutate, isLoading } = useSWR(
    !!token && !!chain.id
      ? ([SWR_KEYS.PROPDATES, token, chain.id, proposal.proposalId] as const)
      : null,
    ([, _token, _chainId, _proposalId]) => getPropDates(_token, _chainId, _proposalId),
    { revalidateOnMount: true, refreshInterval: 1000 * 5 }
  )

  const { decodedTransactions } = useDecodedTransactions(chain.id, proposal)

  const decodedEscrowTxn = useMemo(
    () =>
      decodedTransactions?.find(
        (t) =>
          toLower(t.target) === toLower(getEscrowBundler(chain.id)) ||
          toLower(t.target) === toLower(getEscrowBundlerV1(chain.id))
      ),
    [chain.id, decodedTransactions]
  )

  const { invoiceData } = useInvoiceData(chain.id, decodedEscrowTxn)

  const [showOnlyDaoMembers, setShowOnlyDaoMembers] = useState(false)
  const [replyingTo, setReplyingTo] = useState<PropDate | undefined>(undefined)
  const daoMembers = useDaoMembers(chain.id, token ? token : '')
  const [showForm, setShowForm] = useState(false)

  const filteredPropDates = useMemo(() => {
    const allPropDates = data ?? []
    if (!showOnlyDaoMembers) {
      return allPropDates
    }
    const members = new Set(daoMembers.map((m) => m.toLowerCase()))
    return allPropDates.filter((propDate) => members.has(propDate.creator.toLowerCase()))
  }, [data, showOnlyDaoMembers, daoMembers])

  const handleReplyClick = useCallback(
    (propDateToReply: PropDate) => {
      if (replyingTo?.id === propDateToReply.id) {
        setShowForm(false)
        setReplyingTo(undefined)
      } else {
        setReplyingTo(propDateToReply)
        setShowForm(true)
      }
    },
    [replyingTo]
  )

  const topLevelPropDates = useMemo(
    () =>
      [...filteredPropDates]
        .filter((pd) => !pd.originalMessageId || pd.originalMessageId === zeroHash)
        .sort((a, b) => b.timeCreated - a.timeCreated),
    [filteredPropDates]
  )

  return (
    <Flex className={propPageWrapper}>
      <Box w="100%">
        <Flex justify="space-between" mb="x6" align="center">
          <Text fontSize={20} fontWeight="label">
            Propdates
          </Text>

          <Flex align="center" gap="x2">
            <Button
              variant={!showForm || replyingTo ? 'primary' : 'destructive'}
              size="sm"
              onClick={() => {
                setShowForm(!showForm)
                setReplyingTo(undefined)
              }}
            >
              {showForm && !replyingTo && <Icon id="cross" fill="onAccent" />}
              {showForm ? 'Cancel' : 'Create Propdate'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowOnlyDaoMembers(!showOnlyDaoMembers)}
            >
              {showOnlyDaoMembers ? 'Show All' : 'Show Only DAO Members'}
            </Button>
          </Flex>
        </Flex>

        <Box>
          {showForm && token && (
            <PropDateForm
              {...{
                closeForm: () => {
                  setShowForm(false)
                  setReplyingTo(undefined)
                },
                onSuccess: () => {
                  setShowForm(false)
                  setReplyingTo(undefined)
                  mutate()
                },
                proposalId: proposal.proposalId as `0x${string}`,
                invoiceData,
                replyTo: replyingTo,
              }}
            />
          )}
          {topLevelPropDates.map((propDate) => {
            const replies = [...filteredPropDates]
              .filter(
                (pd) =>
                  pd.originalMessageId === propDate.txid ||
                  pd.originalMessageId === propDate.id
              )
              .sort((a, b) => a.timeCreated - b.timeCreated)

            return (
              <PropDateCard
                key={propDate.id}
                propDate={propDate}
                isReplying={replyingTo?.id === propDate.id}
                onReplyClick={handleReplyClick}
                replies={replies}
                invoiceData={invoiceData}
              />
            )
          })}
          {topLevelPropDates.length === 0 && !isLoading && (
            <Flex
              justify="center"
              p="x6"
              borderColor="border"
              borderStyle="solid"
              borderRadius="curved"
              borderWidth="normal"
              backgroundColor="background2"
            >
              <Text color="text3">No Updates on this proposal yet!</Text>
            </Flex>
          )}
          {isLoading && topLevelPropDates.length === 0 && (
            <Flex direction="column" gap="x4">
              {[...Array(3)].map((_, i) => (
                <Box
                  key={i}
                  p="x6"
                  borderColor="border"
                  borderStyle="solid"
                  borderRadius="curved"
                  borderWidth="normal"
                  backgroundColor="background2"
                  style={{ animation: skeletonAnimation }}
                  height="x32"
                />
              ))}
            </Flex>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
