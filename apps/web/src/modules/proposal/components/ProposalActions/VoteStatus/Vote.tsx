import { ProposalVoteSupport as Support } from '@buildeross/sdk/subgraph'
import { Atoms, Flex, Text } from '@buildeross/zord'
import { ReactNode } from 'react'

import { Icon } from 'src/components/Icon'
import { IconType } from 'src/components/Icon/icons'

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
      <span>
        You voted <span style={{ color: '#E40003' }}>against</span>
      </span>
    ),
  },
  [Support.For]: {
    iconId: 'check',
    iconColor: 'positive',
    text: (
      <span>
        You voted <span style={{ color: '#1CB687' }}>for</span>
      </span>
    ),
  },
  [Support.Abstain]: {
    iconId: 'dash',
    iconColor: 'tertiary',
    text: 'You abstained from voting',
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
