import { Flex, Stack } from '@buildeross/zord'
import { Field } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { defaultInputLabelStyle } from 'src/components/Fields/styles.css'
import { SimulationOutput } from 'src/services/simulationService'

import { BuilderTransaction } from '../../stores'
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
  const router = useRouter()

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
                disabled={disabled || transaction.type === 'upgrade'}
                transaction={transaction}
                handleEdit={() => router.back()}
                simulationUrl={simulation?.url}
              >
                <Field
                  name={`transactions[${i}]`}
                  type="hidden"
                  value={JSON.stringify(transaction.transactions)}
                />
              </TransactionCard>
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
