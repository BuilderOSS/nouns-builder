import { BuilderTransaction } from '@buildeross/stores'
import { SimulationOutput, TransactionType } from '@buildeross/types'
import { defaultInputLabelStyle } from '@buildeross/ui/styles'
import { Flex, Stack } from '@buildeross/zord'

import { SimulationError, TransactionCard } from '../TransactionCard'

export const Transactions = ({
  transactions,
  disabled,
  simulations,
  simulationError,
}: {
  transactions: BuilderTransaction[]
  simulations: SimulationOutput[]
  disabled?: boolean
  simulationError?: string
}) => {
  return (
    <Stack mb={'x10'}>
      <label className={defaultInputLabelStyle}>Transactions</label>
      {transactions.length > 0 && (
        <Stack gap={'x4'}>
          {transactions.map((transaction, i) => {
            const simulation = simulations.find((s) => s.index === i)
            const hasTransactionFailed = simulation?.status === false

            let error
            if (hasTransactionFailed || simulationError) {
              error = hasTransactionFailed
                ? SimulationError.TransactionFailed
                : SimulationError.SimulationFailed
            }

            return (
              <TransactionCard
                key={`${transaction.type}-${i}`}
                simulationError={error}
                disabled={
                  disabled ||
                  transaction.type === TransactionType.UPGRADE ||
                  transaction.type === TransactionType.UPDATE_MINTER
                }
                transaction={transaction}
                simulationUrl={simulation?.url}
              />
            )
          })}
        </Stack>
      )}

      {!!simulationError && (
        <Flex mt={'x4'} color={'negative'} width={'100%'} wrap={'wrap'}>
          {simulationError}
        </Flex>
      )}
    </Stack>
  )
}
