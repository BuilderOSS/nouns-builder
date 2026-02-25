import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Icon, Text } from '@buildeross/zord'
import { Address } from 'viem'

interface ProposalLinkProps {
  proposal: {
    dao: {
      id: string
    }
    proposalId: string
    proposalNumber: number
    title: string
  }
  chainId: number
}

export const ProposalLink = ({ proposal, chainId }: ProposalLinkProps) => {
  const { getProposalLink } = useLinks()

  return (
    <Box mb="x3">
      <Text variant="label-sm" color="text3" mb="x2">
        Proposal
      </Text>
      <Link
        link={getProposalLink(chainId, proposal.dao.id as Address, proposal.proposalId)}
        isExternal
      >
        <Button
          variant="secondaryAccent"
          size="md"
          px="x4"
          gap="x2"
          style={{ fontSize: '14px' }}
        >
          Proposal {proposal.proposalNumber}: {proposal.title}
          <Icon id="arrowTopRight" />
        </Button>
      </Link>
    </Box>
  )
}
