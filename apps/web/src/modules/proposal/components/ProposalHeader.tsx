import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { ProposalState } from '@buildeross/sdk/contract'
import { Proposal } from '@buildeross/sdk/subgraph'
import { Box, Flex, Label, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'

import { Icon } from 'src/components/Icon'
import { useEnsData } from 'src/hooks/useEnsData'
import { useChainStore } from 'src/stores/useChainStore'

import { ProposalNavigation } from './ProposalNavigation'
import { ProposalStatus } from './ProposalStatus'

interface ProposalHeaderProps {
  proposal: Proposal
}

const getDisplayTransactionHash = (proposal: Proposal) => {
  switch (proposal.state) {
    case ProposalState.Executed:
      return proposal.executionTransactionHash
    case ProposalState.Canceled:
      return proposal.cancelTransactionHash
    case ProposalState.Vetoed:
      return proposal.vetoTransactionHash
    default:
      return proposal.transactionHash
  }
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({ proposal }) => {
  const router = useRouter()
  const { title, proposer, proposalNumber } = proposal

  const { displayName: proposerDisplayName } = useEnsData(proposer)
  const chain = useChainStore((x) => x.chain)

  const displayTransactionHash = getDisplayTransactionHash(proposal)

  const status = (
    <Flex align={'center'}>
      <ProposalStatus
        {...proposal}
        showTime={proposal.state === ProposalState.Executed}
      />
      {!!displayTransactionHash && <Icon fill="text3" id="arrowTopRight" />}
    </Flex>
  )

  return (
    <Flex direction={'column'} gap={{ '@initial': 'x4', '@768': 'x7' }} mb={'x2'}>
      <ProposalNavigation
        handleBack={() => {
          router.push({
            pathname: `/dao/[network]/[token]`,
            query: {
              network: router.query.network,
              token: proposal.dao.tokenAddress,
              tab: 'activity',
            },
          })
        }}
      />
      <Flex gap={'x2'} direction={'column'}>
        <Flex align={'center'}>
          <Label fontSize={20} color={'text3'} mr={'x2'}>
            Proposal {proposalNumber}
          </Label>
          {displayTransactionHash ? (
            <a
              href={`${ETHERSCAN_BASE_URL[chain.id]}/tx/${displayTransactionHash}`}
              target="_blank"
              rel="noreferrer"
            >
              {status}
            </a>
          ) : (
            status
          )}
        </Flex>
        <Flex
          direction={{ '@initial': 'column', '@768': 'row' }}
          justify={'space-between'}
          width={'auto'}
          align={{ '@initial': 'flex-start', '@768': 'center' }}
        >
          <Text fontSize={28} fontWeight={'display'}>
            {title}
          </Text>
        </Flex>
        <Flex direction={'row'} align={'center'} justify={'space-between'}>
          <Flex direction={'row'} align={'flex-end'} gap={'x1'}>
            <Text color={'text3'}>By</Text>
            <Box fontWeight={'display'}>
              <a
                href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${proposer}`}
                rel="noreferrer"
                target="_blank"
              >
                {proposerDisplayName}
              </a>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}
