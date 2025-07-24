import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useDecodedTransactions } from '@buildeross/hooks/useDecodedTransactions'
import { getPropDates, type PropDate } from '@buildeross/sdk/eas'
import { Proposal } from '@buildeross/sdk/subgraph'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import { toLower } from 'lodash'
import { useMemo, useState } from 'react'
import { Icon } from 'src/components/Icon'
import {
  getEscrowBundler,
  getEscrowBundlerV1,
} from 'src/modules/create-proposal/components/TransactionForm/Escrow/EscrowUtils'
import { useInvoiceData } from 'src/modules/proposal/components/ProposalDescription/MilestoneDetails/useInvoiceData'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { propPageWrapper } from 'src/styles/Proposals.css'
import useSWR from 'swr'
import { getAddress, zeroHash } from 'viem'

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

  const proposalId = proposal.proposalId

  const { data, mutate } = useSWR(
    !!token && !!chain.id ? [SWR_KEYS.PROPDATES, token, chain.id, proposalId] : null,
    () => getPropDates(token as `0x${string}`, chain.id, proposalId),
    { revalidateOnMount: true, refreshInterval: 1000 * 5 }
  )

  const decodedTransactions = useDecodedTransactions(chain.id, proposal)

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

  const propDates = data ?? []

  const [showOnlyDaoMembers, setShowOnlyDaoMembers] = useState(false)
  const [replyingTo, setReplyingTo] = useState<PropDate | undefined>(undefined)
  const daoMembers = useDaoMembers(chain.id, token ? token : '')
  const [showForm, setShowForm] = useState(false)

  const filteredPropDates = showOnlyDaoMembers
    ? propDates.filter((propDate) => daoMembers.includes(getAddress(propDate.attester)))
    : propDates

  const handleReplyClick = (propDateToReply: PropDate) => {
    if (replyingTo?.txid === propDateToReply.txid) {
      setShowForm(false)
      setReplyingTo(undefined)
    } else {
      setReplyingTo(propDateToReply)
      setShowForm(true)
    }
  }

  const topLevelPropDates = filteredPropDates
    .filter((pd) => !pd.originalMessageId || pd.originalMessageId === zeroHash)
    .sort((a, b) => a.timeCreated - b.timeCreated)

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
              {showOnlyDaoMembers && <Icon id="check" />}
              {showOnlyDaoMembers ? 'DAO Members Only' : 'All Propdates'}
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
                proposalId,
                propDates,
                invoiceData,
                replyTo: replyingTo,
              }}
            />
          )}
          {topLevelPropDates.map((propDate, i) => {
            const replies = filteredPropDates
              .filter((pd) => pd.originalMessageId === propDate.txid)
              .sort((a, b) => a.timeCreated - b.timeCreated)
            return (
              <PropDateCard
                key={`${propDate.txid}-${i}`}
                propDate={propDate}
                index={i}
                isReplying={replyingTo?.txid === propDate.txid}
                onReplyClick={handleReplyClick}
                replies={replies}
                invoiceData={invoiceData}
              />
            )
          })}
          {topLevelPropDates.length === 0 && (
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
        </Box>
      </Box>
    </Flex>
  )
}
