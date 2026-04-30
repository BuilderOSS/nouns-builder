import { ProposalVoteSupport as Support } from '@buildeross/sdk/subgraph'
import { Text } from '@buildeross/zord'

interface VoteLabelProps {
  voteType: Support
}

export const VoteLabel = ({ voteType }: VoteLabelProps) => {
  if (voteType === Support.Abstain) {
    return <>You abstained from voting</>
  }

  const color = voteType === Support.For ? 'positive' : 'negative'
  const text = voteType === Support.For ? 'for' : 'against'

  return (
    <span>
      You voted{' '}
      <Text as="span" color={color}>
        {text}
      </Text>
    </span>
  )
}
