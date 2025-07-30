import SWR_KEYS from '@buildeross/constants/swrKeys'
import { useTimeout } from '@buildeross/hooks/useTimeout'
import { getProposal } from '@buildeross/sdk/subgraph'
import { Flex, Text } from '@buildeross/zord'
import React, { Fragment, useState } from 'react'
import { Countdown } from 'src/components/Countdown'
import { useChainStore } from 'src/stores/useChainStore'
import { useSWRConfig } from 'swr'

interface PendingProps {
  voteStart: number
  proposalId: string
}

const Pending: React.FC<PendingProps> = ({ voteStart, proposalId }) => {
  const { mutate } = useSWRConfig()

  const [isEnded, setIsEnded] = useState<boolean>(false)
  const chain = useChainStore((x) => x.chain)

  const isEndedtimeout = isEnded ? 4000 : null
  useTimeout(() => {
    mutate([SWR_KEYS.PROPOSAL, chain.id, proposalId], getProposal(chain.id, proposalId))
  }, isEndedtimeout)

  const onEnd = () => {
    setIsEnded(true)
  }

  return (
    <Fragment>
      <Flex
        w={{ '@initial': '100%', '@768': 'auto' }}
        justify={'center'}
        align={'center'}
        borderRadius={'curved'}
        borderColor={'border'}
        borderWidth={'normal'}
        borderStyle={'solid'}
        px={'x2'}
        py={'x4'}
        style={{ background: '#FBFBFB', maxHeight: 40, minWidth: 124 }}
      >
        <Text
          fontWeight={'display'}
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontFeatureSettings: 'tnum',
          }}
        >
          <Countdown end={voteStart} onEnd={onEnd} />
        </Text>
      </Flex>

      <Flex textAlign={'center'}>
        <Text
          color={'text3'}
          variant={'paragraph-md'}
          ml={{ '@initial': 'x0', '@768': 'x3' }}
        >
          Time until voting starts
        </Text>
      </Flex>
    </Fragment>
  )
}

export default Pending
