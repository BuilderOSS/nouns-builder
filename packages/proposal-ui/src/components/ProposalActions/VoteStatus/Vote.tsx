import { ProposalVoteSupport as Support } from '@buildeross/sdk/subgraph'
import { Atoms, Flex, Icon, IconType, Text } from '@buildeross/zord'
import { ReactNode } from 'react'

import { VoteLabel } from '../../../VoteLabel'

interface VoteProps {
  support: Support
  weight: number
}

const voteStyleMap: Record<
  Support,
  { iconId: IconType; iconColor: Atoms['color']; text: ReactNode | string }
> = {
  [Support.Against]: {
    iconId: 'cross',
    iconColor: 'negative',
    text: (
      <VoteLabel voteType={Support.Against} />
    ),
  },
  [Support.For]: {
    iconId: 'check',
    iconColor: 'positive',
    text: (
      <VoteLabel voteType={Support.For} />
    ),
  },
  [Support.Abstain]: {
    iconId: 'dash',
    iconColor: 'tertiary',
    text: <VoteLabel voteType={Support.Abstain} />,
  },
}

const Vote: React.FC<VoteProps> = ({ support, weight }) => {
  const votesString = ` with ${weight} ${weight === 1 ? 'vote' : 'votes'}`

  const voteStyle = voteStyleMap[support]

  return (
    <Flex direction={'row'} align={'center'}>
      <Icon
        id={voteStyle.iconId}
        backgroundColor={voteStyle.iconColor}
        borderRadius={'round'}
        p={'x2'}
        fill={'onAccent'}
      />
      <Text fontWeight={'display'} ml={'x3'}>
        {voteStyle.text}
        {support !== Support.Abstain && votesString}
      </Text>
    </Flex>
  )
}

export default Vote
