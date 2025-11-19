import { useProposalState } from '@buildeross/hooks'
import type {
  AddressType,
  BytesType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { Button, Flex, Text } from '@buildeross/zord'
import React from 'react'

import { useLinks } from '../../LinksProvider'
import { LinkWrapper } from '../../LinkWrapper'

interface ProposalActionsProps {
  chainId: CHAIN_ID
  proposalId: BytesType
  proposalNumber: string
  addresses: RequiredDaoContractAddresses
  isExecuted?: boolean
  isUpdate?: boolean
}

export const ProposalActions: React.FC<ProposalActionsProps> = ({
  chainId,
  addresses,
  proposalId,
  proposalNumber,
  isExecuted,
  isUpdate = false,
}) => {
  const { getProposalLink } = useLinks()
  const daoId = addresses.token

  const { isActive, isPending, isLoading } = useProposalState({
    chainId,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  if (isLoading) {
    return (
      <Flex gap="x2" align="center">
        <Text fontSize="14" color="text3">
          Loading...
        </Text>
      </Flex>
    )
  }

  // Executed proposals just show view details
  if (isExecuted) {
    return (
      <Flex gap="x2" align="center" wrap="wrap">
        <LinkWrapper link={getProposalLink(chainId, daoId, proposalNumber, 'details')}>
          <Button size="sm" variant="secondary">
            View Details
          </Button>
        </LinkWrapper>
      </Flex>
    )
  }

  return (
    <Flex gap="x2" align="center" wrap="wrap">
      {/* Active or pending proposals show vote option */}
      {(isActive || isPending) && (
        <>
          <LinkWrapper link={getProposalLink(chainId, daoId, proposalNumber, 'votes')}>
            <Button size="sm" variant="outline">
              Vote
            </Button>
          </LinkWrapper>
          <LinkWrapper
            link={getProposalLink(chainId, daoId, proposalNumber, 'propdates')}
          >
            <Button size="sm" variant="outline">
              {isUpdate ? 'Respond' : 'Add Update'}
            </Button>
          </LinkWrapper>
          <LinkWrapper link={getProposalLink(chainId, daoId, proposalNumber, 'details')}>
            <Button size="sm" variant="secondary">
              View Details
            </Button>
          </LinkWrapper>
        </>
      )}

      {/* Other states just show view details */}
      {!isActive && !isPending && (
        <LinkWrapper link={getProposalLink(chainId, daoId, proposalNumber, 'details')}>
          <Button size="sm" variant="secondary">
            View Details
          </Button>
        </LinkWrapper>
      )}
    </Flex>
  )
}
