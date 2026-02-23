import { useCoinData } from '@buildeross/hooks/useCoinData'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Spinner, Stack } from '@buildeross/zord'

import { Section } from '../Section'
import { CoinItem } from './CoinItem'

interface CoinDetailsProps {
  proposal: Proposal
}

export const CoinDetails = ({ proposal }: CoinDetailsProps) => {
  const { chain } = useChainStore()

  const { coins, isLoading, isCreateTx } = useCoinData(chain.id, proposal)

  if (!isCreateTx) return null

  const isExecuted = !!proposal.executionTransactionHash

  return (
    <Section title="Coin Creations">
      {isLoading && <Spinner size="md" />}

      {!isLoading && (
        <Stack>
          {coins.map((coin, index) => (
            <CoinItem
              key={index}
              coin={coin}
              index={index}
              isExecuted={isExecuted}
              chainId={chain.id}
            />
          ))}
        </Stack>
      )}
    </Section>
  )
}
